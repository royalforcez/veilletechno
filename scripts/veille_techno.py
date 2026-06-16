import feedparser
import mysql.connector
from datetime import datetime, timezone
import time
import json
import re
import html
from urllib.parse import urlparse
import ollama

RSS_FEEDS = [
    "https://www.lemondeinformatique.fr/flux-rss/thematique/virtualisation/rss.xml",
    "https://www.toolinux.com/spip.php?page=backend",
    "https://www.nextinpact.com/rss/news.xml",
    "https://www.zdnet.fr/feeds/rss/actualites/it-management/",
    "https://www.theregister.com/data_centre/virtualisation/headlines.atom",
    "https://devops.com/feed/",
    "https://www.infoworld.com/feed/category/cloud-computing/atom",
    "https://kubernetes.io/feed.xml",
    "https://aws.amazon.com/fr/blogs/aws/feed/"
]

DB_CONFIG = {
    "host": "192.168.1.25",
    "database": "veille",
    "user": "adminbb",
    "password": "veilletechno2026",
    "port": "3306"
}

KEYWORDS_VIP = {
    "vmware": 1.0, "broadcom": 1.0, "proxmox": 1.0, "vsphere": 0.9, "esxi": 0.9,
    "vcf": 0.9, "migration": 0.9, "hyperviseur": 0.9, "hypervisor": 0.9,
    "hyper-v": 0.8, "nutanix": 0.8, "xcp-ng": 0.8, "harvester": 0.8, "ahv": 0.8,
    "pve": 0.8, "xen": 0.7, "kvm": 0.7, "openstack": 0.7, "qemu": 0.6,
    "vates": 0.7, "scale computing": 0.7, "virt-v2v": 0.7, "licence": 0.6,
    "cloud privé": 0.6, "private cloud": 0.6, "ovh": 0.5, "suse": 0.5,
    "sds": 0.5, "storpool": 0.6, "ceph": 0.5,
}

SATURATION_PERTINENCE = 2.5

REPUTATION_SOURCES = {
    "kubernetes.io": 1.0,
    "aws.amazon.com": 0.9,
    "lemondeinformatique.fr": 0.85,
    "zdnet.fr": 0.85,
    "theregister.com": 0.85,
    "infoworld.com": 0.8,
    "nextinpact.com": 0.8,
    "devops.com": 0.75,
    "toolinux.com": 0.7,
}
REPUTATION_DEFAUT = 0.6

FENETRE_FRAICHEUR_JOURS = 30

SEUIL_TOP = 0.80

KEYWORDS_REJECT = [
    "coupe du monde", "tv", "télévision", "iphone", "android auto", "smartphone",
    "directeur général", "acquiert", "m$", "levée de fonds", "achat", "bon plan",
    "solaire", "domestique", "maison", "voiture électrique", "tesla", "jeu vidéo",
    "chatgpt", "openai", "anthropic", "llm", "prompt", "midjourney"
]

def nettoyer_html(texte):
    sans_balises = re.sub(r"<[^>]+>", "", texte or "")
    return re.sub(r"\s+", " ", html.unescape(sans_balises)).strip()

def extraire_tags(texte_complet):
    return [kw for kw in KEYWORDS_VIP if kw in texte_complet]

def calculer_pertinence(texte_complet, tags):
    somme = sum(KEYWORDS_VIP[kw] for kw in tags)
    return min(1.0, somme / SATURATION_PERTINENCE)

def calculer_fraicheur(date_article):
    age_jours = (datetime.now(timezone.utc) - date_article).total_seconds() / 86400
    return max(0.0, 1.0 - age_jours / FENETRE_FRAICHEUR_JOURS)

def reputation_source(domaine):
    for fragment, note in REPUTATION_SOURCES.items():
        if fragment in domaine:
            return note
    return REPUTATION_DEFAUT

def analyser_article(titre, description, date_article, domaine):
    texte_complet = f"{titre} {description}".lower()
    tags = extraire_tags(texte_complet)

    pertinence = calculer_pertinence(texte_complet, tags)
    fraicheur = calculer_fraicheur(date_article)
    reputation = reputation_source(domaine)
    score = round(0.5 * pertinence + 0.3 * fraicheur + 0.2 * reputation, 3)

    base = {"tags": tags, "score": score, "is_top": score >= SEUIL_TOP}

    if tags:
        return {**base, "est_pertinent": True, "tri": "Auto-VIP"}

    if any(kw in texte_complet for kw in KEYWORDS_REJECT):
        return {**base, "est_pertinent": False, "tri": "Auto-Rejet"}

    prompt = f"""
    Analyse succinctement si cet article parle d'informatique professionnelle (DevOps, serveurs, cloud) :
    Titre : {titre}
    Description : {description}
    Réponds uniquement : OUI ou NON.
    """
    try:
        response = ollama.chat(
            model="llama3",
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0.0}
        )
        raw_content = response['message']['content'].strip().upper()
        return {**base, "est_pertinent": "OUI" in raw_content, "tri": "IA-Tri"}
    except Exception as e:
        return {**base, "est_pertinent": False, "tri": "IA-Indispo"}

def sauvegarder_en_bdd(titre, source, date_article, resume, lien, score, is_top, tags):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        query = """
            INSERT IGNORE INTO articles
                (titre, source, date_publication, resume, lien, score, is_top, tags)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """
        cursor.execute(query, (
            titre,
            source,
            date_article.strftime('%Y-%m-%d %H:%M:%S'),
            resume,
            lien,
            score,
            1 if is_top else 0,
            json.dumps(tags, ensure_ascii=False),
        ))
        conn.commit()

        if cursor.rowcount > 0:
            print(f"Indexé en BDD (Debian) [score {score}] : {titre}")
        else:
            print(f"Entrée déjà existante (Doublon) : {titre}")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Echec de la journalisation en BDD : {e}")

if __name__ == "__main__":
    print("Initialisation du service de veille technologique...")
    for url in RSS_FEEDS:
        print(f"\nTraitement du flux : {url}")
        try:
            flux = feedparser.parse(url)
            if flux.bozo:
                print(f"Flux invalide ou inaccessible : {url}")
                continue

            domaine = urlparse(url).netloc
            source = (flux.feed.get('title') or domaine).strip()

            for entry in flux.entries:
                titre = entry.get('title', '').strip()
                description = nettoyer_html(entry.get('summary', entry.get('description', '')))
                lien = entry.get('link', '').strip()
                if not titre or not lien:
                    continue

                date_parsed = entry.get('published_parsed') or entry.get('updated_parsed')
                if date_parsed:
                    date_article = datetime.fromtimestamp(time.mktime(date_parsed), tz=timezone.utc)
                else:
                    date_article = datetime.now(timezone.utc)

                analyse = analyser_article(titre, description, date_article, domaine)
                if analyse["est_pertinent"]:
                    sauvegarder_en_bdd(
                        titre, source, date_article, description, lien,
                        analyse["score"], analyse["is_top"], analyse["tags"],
                    )
                else:
                    print(f"Écarté ({analyse['tri']}) : {titre}")
        except Exception as e:
            print(f"Erreur lors du traitement du flux {url} : {e}")

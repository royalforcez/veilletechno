import feedparser
import mysql.connector
from datetime import datetime
import time
import ollama

# 1. CONFIGURATION DES FLUX RSS SÉLECTIONNÉS
# ---------------------------------------------------------------------
RSS_FEEDS = [
    "https://www.lemondeinformatique.fr/flux-rss/thematique/virtualisation/rss.xml",
    "https://www.toolinux.com/spip.php?page=backend",  # Corrigé pour SPIP
    "https://www.nextinpact.com/rss/news.xml",
    "https://www.zdnet.fr/feeds/rss/actualites/it-management/",
    "https://www.theregister.com/data_centre/virtualisation/headlines.atom", # Passé en Atom pour la stabilité
    "https://devops.com/feed/",
    "https://www.infoworld.com/feed/category/cloud-computing/atom", # Corrigé
    "https://kubernetes.io/feed.xml",
    "https://aws.amazon.com/fr/blogs/aws/feed/"
]

# Configure tes accès à la base Debian ici :
DB_CONFIG = {
    "host": "192.168.1.25", 
    "database": "veille",
    "user": "adminbb",
    "password": "veilletechno2026",
    "port": "3306"
}

# Liste des mots-clés techniques prioritaires (Validation automatique)
KEYWORDS_VIP = [
    "vmware", "broadcom", "proxmox", "pve", "xcp-ng", "xen", "hyper-v", "nutanix", 
    "ahv", "harvester", "suse", "kvm", "qemu", "openstack", "virt-v2v", "migration", 
    "vcf", "vsphere", "esxi", "licence", "cloud privé", "private cloud", "hyperviseur",
    "hypervisor", "ovh", "vates", "scale computing", "sds", "storpool", "ceph"
]

# Liste des mots-clés grand public / business (Rejet automatique)
KEYWORDS_REJECT = [
    "coupe du monde", "tv", "télévision", "iphone", "android auto", "smartphone",
    "directeur général", "acquiert", "m$", "levée de fonds", "achat", "bon plan",
    "solaire", "domestique", "maison", "voiture électrique", "tesla", "jeu vidéo",
    "chatgpt", "openai", "anthropic", "llm", "prompt", "midjourney"
]

# 2. ANALYSE HYBRIDE CORRIGÉE
# ---------------------------------------------------------------------
def analyser_article(titre, description):
    texte_complet = f"{titre} {description}".lower()
    
    # Étape A : Filtrage par mots-clés VIP (Gain de temps et sécurité)
    if any(kw in texte_complet for kw in KEYWORDS_VIP):
        return {
            "est_pertinent": True,
            "condense_technique": f"[Auto-VIP] Détection de mots-clés d'infrastructure ou sécurité dans l'article."
        }
        
    # Étape B : Filtrage par mots-clés indésirables
    if any(kw in texte_complet for kw in KEYWORDS_REJECT):
        return {
            "est_pertinent": False,
            "condense_technique": ""
        }

    # Étape C : Recours à l'IA uniquement si indécis
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
        return {
            "est_pertinent": "OUI" in raw_content,
            "condense_technique": f"[IA-Tri] Analysé par le modèle local."
        }
    except Exception as e:
        return {"est_pertinent": False, "condense_technique": ""}

# 3. PERSISTANCE DES DONNÉES DANS MARIADB
# ---------------------------------------------------------------------
def sauvegarder_en_bdd(titre, date_article, resume, lien):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        query = """
            INSERT IGNORE INTO articles (titre, date_publication, resume, lien) 
            VALUES (%s, %s, %s, %s);
        """
        cursor.execute(query, (titre, date_article, resume, lien))
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"✅ Indexé en BDD (Debian) : {titre}")
        else:
            print(f"⏭️ Entrée déjà existante (Doublon) : {titre}")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"❌ Échec de la journalisation en BDD : {e}")

# 4. POINT D'ENTRÉE DU SCRIPT
# ---------------------------------------------------------------------
if __name__ == "__main__":
    print("🚀 Initialisation du service de veille technologique...")
    for url in RSS_FEEDS:
        print(f"\nTraitement du flux : {url}")
        try:
            flux = feedparser.parse(url)
            if flux.bozo:
                print(f"⚠️ Flux invalide ou inaccessible : {url}")
                continue
            for entry in flux.entries:
                titre = entry.get('title', '').strip()
                description = entry.get('summary', entry.get('description', '')).strip()
                lien = entry.get('link', '').strip()
                if not titre or not lien:
                    continue
                
                date_parsed = entry.get('published_parsed') or entry.get('updated_parsed')
                if date_parsed:
                    date_article = datetime.fromtimestamp(time.mktime(date_parsed)).strftime('%Y-%m-%d %H:%M:%S')
                else:
                    date_article = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
                analyse = analyser_article(titre, description)
                if analyse["est_pertinent"]:
                    sauvegarder_en_bdd(titre, date_article, analyse["condense_technique"], lien)
                else:
                    print(f"🗑️ Écarté (Bruit/Corporate) : {titre}")
        except Exception as e:
            print(f"❌ Erreur lors du traitement du flux {url} : {e}")

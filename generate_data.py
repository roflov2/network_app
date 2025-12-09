import pandas as pd
import random
import networkx as nx
import json
import os

def generate_real_data():
    print("Generating realistic data...")

    # Data Pools
    REAL_PEOPLE = [
        "Daniel Craig", "Margot Robbie", "Hugh Jackman", "Nicole Kidman", 
        "Chris Hemsworth", "Cate Blanchett", "Russell Crowe", "Kylie Minogue", 
        "Sia Furler", "Troye Sivan", "Eric Bana", "Rose Byrne", 
        "Heath Ledger", "Paul Hogan", "Steve Irwin", "Rebel Wilson",
        "Liam Hemsworth", "Geoffrey Rush", "Baz Luhrmann", "Miranda Kerr"
    ]
    
    REAL_ORGS = [
        "Google", "Telstra", "Commonwealth Bank", "BHP", 
        "Woolworths", "Qantas", "Atlassian", "Canva", 
        "Rio Tinto", "Macquarie Group", "Westpac", "NAB",
        "CSL", "Woodside Energy", "Coles Group"
    ]
    
    REAL_PHONES = [
        "0424 466 387", "0412 345 678", "0498 765 432", 
        "(02) 9999 8888", "1300 655 506", "0400 111 222", 
        "(03) 8888 7777", "1800 000 000", "0455 666 777",
        "0433 999 111", "(07) 3333 4444", "0477 888 999"
    ]
    
    REAL_WEBSITES = [
        "www.telstra.com.au", "www.google.com.au", "www.commbank.com.au",
        "www.bhp.com", "www.woolworths.com.au", "www.qantas.com",
        "www.atlassian.com", "www.canva.com", "www.riotinto.com",
        "www.macquarie.com", "www.westpac.com.au", "www.nab.com.au"
    ]

    # Crypto wallet addresses (mix of Bitcoin, Ethereum, Litecoin formats)
    REAL_CRYPTO_WALLETS = [
        "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",  # Bitcoin (Satoshi's address)
        "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",  # Bitcoin P2SH
        "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080",  # Bitcoin Bech32
        "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",  # Ethereum
        "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",  # Ethereum
        "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",  # Ethereum (Vitalik)
        "LQTpS3VaYTjCr4s9Y1t5zbeY26zevf7Fb3",  # Litecoin
        "ltc1qw508d6qejxtdg4y5r3zarvary0c5xw7kgmn4n9",  # Litecoin Bech32
    ]

    from faker import Faker
    fake = Faker('en_AU')  # Use Australian locale
    
    # Generate realistic entities to reach target size
    TARGET_PEOPLE = 600
    TARGET_ORGS = 150
    TARGET_PHONES = 300
    TARGET_WEBSITES = 150
    TARGET_CRYPTO = 100
    
    # 1. People: Combine famous list with Faker names
    generated_people = [fake.name() for _ in range(TARGET_PEOPLE - len(REAL_PEOPLE))]
    all_people = list(set(REAL_PEOPLE + generated_people)) # Deduplicate
    
    # 2. Orgs: Combine famous list with Faker companies
    generated_orgs = [fake.company() + f" {fake.company_suffix()}" for _ in range(TARGET_ORGS - len(REAL_ORGS))]
    all_orgs = list(set(REAL_ORGS + generated_orgs))
    
    # 3. Phones: Use Faker for Aussie numbers
    generated_phones = [fake.phone_number() for _ in range(TARGET_PHONES - len(REAL_PHONES))]
    all_phones = list(set(REAL_PHONES + generated_phones))
    
    # 4. Websites: Generate based on orgs or random domains
    generated_websites = []
    for _ in range(TARGET_WEBSITES - len(REAL_WEBSITES)):
         domain = fake.domain_name()
         generated_websites.append(f"www.{domain}")
    all_websites = list(set(REAL_WEBSITES + generated_websites))

    # 5. Crypto Wallets: Generate realistic-looking wallet addresses
    def generate_crypto_wallet():
        """Generate a random crypto wallet address in various formats"""
        wallet_type = random.choice(['btc_legacy', 'btc_p2sh', 'btc_bech32', 'eth', 'ltc'])
        if wallet_type == 'btc_legacy':
            # Bitcoin legacy (starts with 1)
            chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
            return '1' + ''.join(random.choice(chars) for _ in range(33))
        elif wallet_type == 'btc_p2sh':
            # Bitcoin P2SH (starts with 3)
            chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
            return '3' + ''.join(random.choice(chars) for _ in range(33))
        elif wallet_type == 'btc_bech32':
            # Bitcoin Bech32 (starts with bc1q)
            chars = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
            return 'bc1q' + ''.join(random.choice(chars) for _ in range(38))
        elif wallet_type == 'eth':
            # Ethereum (starts with 0x)
            chars = '0123456789abcdefABCDEF'
            return '0x' + ''.join(random.choice(chars) for _ in range(40))
        else:
            # Litecoin (starts with L or M)
            chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
            return random.choice('LM') + ''.join(random.choice(chars) for _ in range(33))

    generated_crypto = [generate_crypto_wallet() for _ in range(TARGET_CRYPTO - len(REAL_CRYPTO_WALLETS))]
    all_crypto = list(set(REAL_CRYPTO_WALLETS + generated_crypto))
    
    NUM_DOCS = 180
    docs = [f"DOC-{fake.unique.random_int(min=1000, max=9999)}" for _ in range(NUM_DOCS)]
    
    all_nodes = all_people + all_orgs + docs + all_phones + all_websites + all_crypto
    print(f"Total nodes generated: {len(all_nodes)}")
    print(f"  - People: {len(all_people)}, Orgs: {len(all_orgs)}, Phones: {len(all_phones)}, Websites: {len(all_websites)}, Crypto: {len(all_crypto)}, Docs: {len(docs)}")
    
    edges = []
    
    # Helper to add edge
    def add_edge(source, target, edge_type, target_type):
        edges.append({
            'Source': source,
            'Target': target,
            'Edge_Type': edge_type,
            'Target_Type': target_type
        })

    # Generate Edges - STRICT BIPARTITE/DOCUMENT-CENTRIC MODEL
    # Entities do NOT connect to each other directly.
    # They are connected because they appear in the same DOCUMENT.
    # Structure: Entity <-> Document <-> Entity
    
    for doc in docs:
        topic = fake.bs()
        
        # 1. PERSON ENTITIES
        # A document mentions 2-6 people
        doc_people = []
        for _ in range(random.randint(2, 6)):
            p = random.choice(all_people)
            add_edge(doc, p, 'MENTIONS', 'Person')
            # Inverse edge (optional but good for graph traversal if undirected)
            # add_edge(p, doc, 'APPEARS_IN', 'Document') 
            doc_people.append(p)
            
        # 2. ORGANISATION ENTITIES
        # A document mentions 1-3 organisations
        for _ in range(random.randint(1, 3)):
            org = random.choice(all_orgs)
            add_edge(doc, org, 'MENTIONS', 'Organisation')
            
        # 3. PHONE ENTITIES
        # A document contains 1-2 phone numbers (often linked to the people/orgs conceptually)
        for _ in range(random.randint(1, 2)):
            phone = random.choice(all_phones)
            add_edge(doc, phone, 'MENTIONS', 'Phone')
            
        # 4. WEBSITE ENTITIES
        # A document mentions 0-2 websites
        if random.random() > 0.4:
            for _ in range(random.randint(1, 2)):
                web = random.choice(all_websites)
                add_edge(doc, web, 'MENTIONS', 'Website')

        # 5. CRYPTO WALLET ENTITIES
        # A document mentions 0-2 crypto wallets (less common)
        if random.random() > 0.6:
            for _ in range(random.randint(1, 2)):
                wallet = random.choice(all_crypto)
                add_edge(doc, wallet, 'MENTIONS', 'Crypto')

    # --- INJECT TEST DATA FOR PATHFINDING ---
    # Create multiple paths between "Daniel Craig" and "Google"
    # Path 1: Daniel Craig -> DOC-TEST-1 -> Google
    # Path 2: Daniel Craig -> DOC-TEST-2 -> Google
    # This guarantees 2 paths of length 2
    
    test_doc_1 = "DOC-TEST-PATH-1"
    test_doc_2 = "DOC-TEST-PATH-2"
    target_person = "Daniel Craig"
    target_org = "Google"
    
    # Ensure they exist in our lists (should be there from REAL_PEOPLE/REAL_ORGS)
    if target_person in all_people:
        add_edge(test_doc_1, target_person, 'MENTIONS', 'Person')
        add_edge(test_doc_2, target_person, 'MENTIONS', 'Person')
        
    if target_org in all_orgs:
        add_edge(test_doc_1, target_org, 'MENTIONS', 'Organisation')
        add_edge(test_doc_2, target_org, 'MENTIONS', 'Organisation')
        
    # Create DataFrame
    df_edges = pd.DataFrame(edges)

    descriptions = []
    doc_topics = [
        "Project Alpha quarterly report", "Internal investigation summary", 
        "Board meeting minutes", "Confidential memo regarding assets",
        "Public press release", "Audit findings 2024", 
        "Email correspondence archive", "Suspicious transaction report",
        "Partnership agreement draft", "Employee performance review"
    ]
    
    for doc in docs:
        topic = random.choice(doc_topics)
        entities = df_edges[df_edges['Source'] == doc]['Target'].tolist()
        desc_text = f"Document regarding {topic}. "
        if entities:
            desc_text += f"Primary entities mentioned include {', '.join(entities[:3])}."
        if len(entities) > 3:
            desc_text += f" Also references {len(entities)-3} other parties."
            
        descriptions.append({
            'Reference Number': doc,
            'Description': desc_text
        })

    # Add descriptions for injected test documents
    descriptions.append({'Reference Number': test_doc_1, 'Description': "Test document for pathfinding 1 (Google <-> Daniel Craig)"})
    descriptions.append({'Reference Number': test_doc_2, 'Description': "Test document for pathfinding 2 (Google <-> Daniel Craig)"})
        
    df_desc = pd.DataFrame(descriptions)
    
    # Determine output paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(script_dir, 'backend')
    frontend_dir = os.path.join(script_dir, 'frontend', 'src')

    # Save to backend (pickle format)
    print(f"Saving {len(df_edges)} edges to backend/edges.pkl")
    df_edges.to_pickle(os.path.join(backend_dir, 'edges.pkl'))

    print(f"Saving {len(df_desc)} descriptions to backend/desc.pkl")
    df_desc.to_pickle(os.path.join(backend_dir, 'desc.pkl'))

    # Save to frontend (JSON format for static deployment)
    static_json_path = os.path.join(frontend_dir, 'staticData.json')
    print(f"Saving {len(df_edges)} edges to frontend/src/staticData.json")
    with open(static_json_path, 'w') as f:
        json.dump(edges, f)

    print("Done!")

if __name__ == "__main__":
    generate_real_data()

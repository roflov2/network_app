import os
from dotenv import load_dotenv
from openai import OpenAI
from typing import Optional

load_dotenv()

# Initialize OpenAI Client
# Ensure OPENAI_API_KEY is set in your .env file
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyze_network_relationships(descriptions: str, start: str, entities: Optional[list] = None) -> dict:
    """
    Sends descriptions and entities to OpenAI to analyze potential network relationships.

    Args:
        descriptions (str): Text descriptions of the content.
        entities (list): List of important entities extracted from the content.

    Returns:
        dict: Dictionary containing the network relationship summary or error information.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at scam signals based on reports submitted by the public"
                },
                {
                    "role": "user",
                    "content": f'''     1. Summarise the following scam report submissions: {descriptions}
                                        2. Identify any common connections or patters between them
                                        3. One of the common entities connecting these reports together is: {start}
                                        4. Utilise Australian English in your summary
                                        5. Keep summary under 250 words (approx)
                                '''
                }
            ],
            max_tokens=500
        )

        summary = response.choices[0].message.content
        return {"summary": summary, "status": "success"}

    except Exception as e:
        return {"summary": None, "status": "error", "error": str(e)}
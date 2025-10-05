import itertools
from collections import Counter
from keybert import KeyBERT
import pandas as pd

kw_model = KeyBERT('all-MiniLM-L6-v2')
metadata = pd.read_csv("newmetadata.csv")


def extract_keywords(text):
    try:
        keywords = kw_model.extract_keywords(
            text,
            keyphrase_ngram_range=(1, 3),
            stop_words='english',
            top_n=5
        )
        return [k[0] for k in keywords]
    except:
        return []


metadata['keywords'] = metadata['text'].apply(extract_keywords)
metadata.to_csv("metadata_with_keywords.csv", index=False)


all_keywords = list(itertools.chain.from_iterable(metadata['keywords']))
counter = Counter(all_keywords)

common = counter.most_common(20)
rare = [k for k, c in counter.items() if c <= 3]

print("🔥 Top 10 Concepts:", common[:10])
print("🧊 Rare Concepts:", rare[:10])

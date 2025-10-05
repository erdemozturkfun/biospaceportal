
import itertools
from collections import Counter
import pandas as pd

metadata = pd.read_csv('metadata_with_keywords.csv')

metadata['keywords_list'] = metadata['keywords'].apply(lambda x: x.split(', '))

all_keywords = list(itertools.chain.from_iterable(metadata['keywords_list']))
print(all_keywords)
counter = Counter(all_keywords)

common = counter.most_common(20)
rare = [k for k, c in counter.items() if c <= 3]

print("🔥 Top 10 Concepts:", common[:20])
print("🧊 Rare Concepts:", rare[:20])

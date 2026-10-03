import re

file_path = r'c:\Users\jatin\OneDrive\Desktop\Project DNA\client\src\components\PremiumResumeSection.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace \" with " and \n with real newline in the corrupted part
def unescape(m):
    return m.group(0).replace('\\"', '"').replace('\\n', '\n').replace('\\', '')

content = re.sub(r'className=\\"p-6\\".*?{/\* Quick Actions', unescape, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

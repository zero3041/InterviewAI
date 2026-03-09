from openai import OpenAI

client = OpenAI(
base_url="http://127.0.0.1:8045/v1",
api_key="sk-25747028018447bbbfcb478670a0a277"
)

response = client.chat.completions.create(
model="claude-sonnet-4-6",
messages=[{"role": "user", "content": "Hello"}]
)

print(response.choices[0].message.content)

gemini-3.1-pro-high
gemini-3-pro-low
gemini-2.5-flash
gemini-3-flash
gemini-2.5-flash-lite
claude-opus-4-6-thinking
gemini-3-pro-high
gemini-2.5-pro
gemini-3.1-flash-image
gemini-2.5-flash-thinking
gemini-3.1-pro-low
gpt-oss-120b-medium

# Revolt LLM

LLM-based application builder playground with support for Gemini and Claude. The project uses a small, toy framework for creation of the GenAI apps called [revolt](https://github.com/mgechev/revolt).

Revolt has a minimal syntax and is optimized for:

- Adding new code easily
- Fine-grained reactivity

## How to use?

1. Create and add tokens to `.env`. Get Gemini token from [AI Studio](https://aistudio.google.com/apikey) and (optionally) Claude token from the Anthropics [console](https://console.anthropic.com/settings/keys).

```
GEMINI_API_KEY=[Gemini token comes here]
ANTHROPIC_API_KEY=[Claude token comes here]
MODEL=[gemini or claude]
```

2. Run the project:

```bash
git clone git@github.com:mgechev/revolt-llm
cd revolt-llm
npm i
npm start
```

3. Open in the browser! http://localhost:42000

4. Enjoy!

## License

MIT


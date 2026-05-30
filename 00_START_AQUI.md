# 00_START_AQUI — Mega Pack NexArtWO

Este mega pack ya viene organizado para descomprimirlo directamente dentro de la raíz del repo local de NexArtWO.

## Dónde descomprimir

Descomprime el contenido de este ZIP dentro de:

```txt
D:\My Bussines\Strategy\NexArtWO
```

La raíz del repo debe quedar así:

```txt
D:\My Bussines\Strategy\NexArtWO
│
├── AGENTS.md
├── CLAUDE.md
├── .cursorrules
├── .claude\
├── .cursor\
├── .codex\
├── .github\
├── docs\
├── memory\
├── skills\
├── templates\
├── agent-starter-prompts\
│
├── index.html
├── projects.html
├── js\
├── css\
└── ...
```

## Importante

Este pack NO contiene el código de la app.  
Solo contiene documentación, reglas, prompts, memoria, skills y configuración de agentes.

No debe borrar tus archivos actuales como:

```txt
index.html
projects.html
js\
css\
sql\
supabase\
```

## Primer commit recomendado

Después de descomprimir:

```bash
git checkout -b docs/mega-project-control-pack
git add AGENTS.md CLAUDE.md .claude .cursor .codex .github .cursorrules docs memory skills templates agent-starter-prompts 00_START_AQUI.md INSTALLATION_GUIDE.md AGENT_CONFIGURATION_GUIDE.md README.md
git commit -m "docs: add NexArtWO mega project control pack"
```

No mezcles este commit con cambios de código.

## Primer prompt para el agente

Después de instalar, abre tu agente y copia el contenido de:

```txt
agent-starter-prompts\01_START_NEW_SESSION_PROMPT.md
```

## Primera tarea segura

Después de que el agente confirme contexto, usa:

```txt
agent-starter-prompts\02_FIRST_SAFE_TASK_FUNCTION_INDEX.md
```

Esa tarea es solo lectura + documentación. No debe tocar código.

## Regla de oro

El agente no escribe código hasta que tú digas:

```txt
GO
```

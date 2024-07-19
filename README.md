# auditorIA

## Como correr en desarrollo

1.0. Nos aseguramos de tener la versión correcta de Node.js

```bash
  $ node -v
  > v22.2.0
```

> Personalmente utilizo [**Node Version Manager**](https://github.com/coreybutler/nvm-windows) en Windows para manejar las versiones de Node, por lo que voy a mostrar cómo hacerlo con este software.

1.1. Chequeamos qué versión tenemos activa (lo mismo que `node -v`)

```bash
  $ nvm current
  > v22.2.0

```

1.2. Si tenemos una versión antigua o no compatible, instalaremos la **22.2.0**

```bash
  $ nvm install 22.2.0 [arch = 32 | 64]
  > Downloading node.js version 22.2.0 (64-bit)...
  > Extracting node and npm...
  > Complete
  > npm v10.7.0 installed successfully.

  > Installation complete. If you want to use this version, type
  > nvm use 22.2.0
```

1.3.0. Corroboramos que estamos usando nvm

```bash
  $ nvm on
  > nvm enabled
  > Now using node v20.15.1 (64-bit)
```

1.3.1. Cambiaremos a la versión instalada si teníamos otra

```bash
  $ nvm use 22.2.0
  > Now using node v22.2.0 (64-bit)
```

2. Nos dirigimos a la ruta donde se encuentra el repositorio e instalamos las dependencias

```bash
  z auditorIA
  npm install
```

3. Abrimos el proyecto en modo dev para ver los cambios en tiempo real

```bash

  npm run dev
```

> [!IMPORTANT]
> Si nos sale el error de que ya existe un listen en el puerto 3001 seguimos los siguientes pasos

```bash
$ npm run dev

> next@0.1.0 dev
> next dev --port 3001

 ⨯ Failed to start server
Error: listen EADDRINUSE: address already in use :::3001
    at Server.setupListenHandle [as _listen2] (node:net:1898:16)
    at listenInCluster (node:net:1946:12)
    at Server.listen (node:net:2044:7)
    [...]
    at process.emit (node:events:520:28) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 3001
}
```

Podemos correr el siguiente comando en PowerShell

```pwsh
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess
```

Si encontramos el siguiente output, diciéndonos que hay un proceso de Node escuchando ese puerto

```bash
  NPM(K)    PM(M)      WS(M)     CPU(s)      Id  SI ProcessName
  ------    -----      -----     ------      --  -- -----------
      195   610,96     292,90      12,39   12852   1 node
```

Podemos proceder a cerrarlo

```pwsh
  taskkill /PID [id del proceso] /F
```

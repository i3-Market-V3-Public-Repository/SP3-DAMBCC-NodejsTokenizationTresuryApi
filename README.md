#Run with docker

```dockerfile
docker build -t i3-treasury .
docker run --name treasury -p 3001:3001 -e ETH_HOST='{EthereumChainWebsocketHost}' -e CONTRACT_ADDRESS='{CONTRACT_ADDRESS}' -e WEBHOOK='{WEBHOOK}' -e PORT=3001 i3-treasury
```
BASEDIR=$(cd "$(dirname ${BASH_SOURCE[0]})" && pwd)
PROJECT_DIR="$BASEDIR/../"

if ! docker info | grep -iq 'Swarm: active'; then
    exit 1
fi

docker service rm myStack_backend
docker build -t 127.0.0.1:5000/ecommerce-backend:latest "$PROJECT_DIR/backend"
docker push 127.0.0.1:5000/ecommerce-backend:latest
docker stack deploy -c "$PROJECT_DIR/docker-compose.dev.yml" myStack
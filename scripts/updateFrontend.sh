BASEDIR=$(cd "$(dirname ${BASH_SOURCE[0]})" && pwd)
PROJECT_DIR="$BASEDIR/../"

if ! docker info | grep -iq 'Swarm: active'; then
    exit 1
fi

docker build -t 127.0.0.1:5000/ecommerce-frontend:latest "$PROJECT_DIR/frontend"
docker push 127.0.0.1:5000/ecommerce-frontend:latest
docker service update --force myStack_frontend
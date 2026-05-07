BASEDIR=$(cd "$(dirname ${BASH_SOURCE[0]})" && pwd)
PROJECT_DIR="$BASEDIR/../"

if docker info | grep -iq 'Swarm: active'; then
    docker swarm leave --force
fi

docker swarm init
docker service create --name registry --publish mode=host,target=5000,published=5000,protocol=tcp registry:2
docker build -t 127.0.0.1:5000/ecommerce-frontend:latest "$PROJECT_DIR/frontend"
docker build -t 127.0.0.1:5000/ecommerce-backend:latest "$PROJECT_DIR/backend"
docker push 127.0.0.1:5000/ecommerce-frontend:latest
docker push 127.0.0.1:5000/ecommerce-backend:latest 
docker stack deploy -c "$PROJECT_DIR/docker-compose.yml" myStack 
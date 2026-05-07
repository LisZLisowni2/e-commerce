if ! docker info | grep -iq 'Swarm: active'; then
    exit 1
fi

if ! docker stack ps myStack &>/dev/null; then
    exit 1
fi

docker service update --force myStack_nginx-backend
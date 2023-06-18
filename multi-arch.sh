ARCH=$(uname -m)
for D in $(ls -1d --color=none cimple-*)
do
    echo $D
    if [ ! -d $D ]; then
        continue
    fi
    IMAGE=taksan/$D
    echo "Creating manifest for $IMAGE"
    docker pull $IMAGE:v1-aarch64
    docker manifest create $IMAGE:v1 --amend $IMAGE:v1-aarch64 --amend $IMAGE:v1-$ARCH
    docker manifest push $IMAGE:v1
done


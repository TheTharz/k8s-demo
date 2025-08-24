kubectl apply -f mongo_secrets.yaml 
kubectl apply -f mongo_deployment.yaml
kubectl apply -f mongo_service.yaml

kubectl apply -f backend_secrets.yaml
kubectl apply -f backend_deployment.yaml
kubectl apply -f backend_service.yaml

kubectl apply -f frontend_secrets.yaml
kubectl apply -f frontend_deployment.yaml
kubectl apply -f frontend_service.yaml

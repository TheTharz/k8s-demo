minikube stop
this will shutdown the minikube gracefully

minikube start
to start the service

minikube stop
this will shutdown the minikube gracefully

minikube start
to start the service

## Restarting with Multiple Namespaces

After `minikube start`, your cluster will be running but your deployments need to be reapplied:

### Check existing namespaces:

```bash
kubectl get namespaces
```

### If you have custom namespaces, recreate them:

```bash
kubectl create namespace <your-namespace-name>
```

### Reapply all your deployments:

```bash
# Run your start script to redeploy everything
./start.sh

# Or apply specific namespaces if needed:
kubectl apply -f . -n <namespace-name>
```

### Verify everything is running:

```bash
kubectl get pods --all-namespaces
kubectl get services --all-namespaces
```

**Note:** `minikube start` preserves the cluster state, so your namespaces and some configurations may persist, but deployments typically need to be reapplied.

// ...existing code...

### Verify everything is running:

```bash
kubectl get pods --all-namespaces
kubectl get services --all-namespaces
```

### Additional Services to Check/Restart:

#### Monitoring Stack:

```bash
# Check if monitoring namespace exists
kubectl get namespace monitoring

# If you have Prometheus/Grafana:
kubectl get pods -n monitoring
kubectl get services -n monitoring

# Restart monitoring if needed:
kubectl apply -f monitoring/ -n monitoring
```

#### Ingress Controller:

```bash
# Check ingress controller status
kubectl get pods -n ingress-nginx
minikube addons list | grep ingress

# Enable ingress if disabled:
minikube addons enable ingress
```

#### Dashboard and Other Add-ons:

```bash
# Check enabled addons
minikube addons list

# Start dashboard if needed:
minikube dashboard --url &

# Check other common addons:
minikube addons enable metrics-server
minikube addons enable registry
```

#### Port Forwarding (if used):

```bash
# Restart any port forwards you were using:
kubectl port-forward service/frontend-service 3000:3000 &
kubectl port-forward service/backend-service 8080:8080 &
```

**Note:** `minikube start` preserves the cluster state, so your namespaces and some configurations may persist, but deployments typically need to be reapplied.

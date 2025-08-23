# Kubernetes Monitoring Setup

## Prerequisites

- Helm ≥ 3
- Helmfile ≥ 0.153
- kubectl configured

---

## Install Helm Diff Plugin

```bash
helm plugin install https://github.com/databus23/helm-diff
helm plugin update diff
```

---

## Add Helm Repositories

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add elastic https://helm.elastic.co
helm repo update
```

---

## Apply Helmfile

```bash
# Diff changes
helmfile diff

# Apply all releases
helmfile apply
```

---

## Install CRDs (if needed)

```bash
kubectl apply -f https://github.com/prometheus-operator/prometheus-operator/raw/main/bundle.yaml
```

---

## Check Status

```bash
kubectl get pods -n monitoring
kubectl get pods -n logging
```

---

## Troubleshooting

```bash
# Force delete stuck pods
kubectl delete pod <pod-name> -n <namespace> --grace-period=0 --force

# View logs
kubectl logs <pod-name> -n <namespace>

# View events
kubectl get events -n <namespace>
```

---

## Cleanup

```bash
helmfile destroy
kubectl delete ns monitoring logging
```

getting admin password for grafana
kubectl get secret monitoring-stack-grafana -n monitoring -o jsonpath="{.data.admin-password}" | base64 --decode

helmfile -f helmfile.yaml destroy

kubectl get pods -n logging
kubectl get svc -n logging
kubectl get deployments -n logging

kubectl get pods -n default
kubectl get svc -n default
kubectl get deployments -n default

kubectl get pods -n monitoring
kubectl get svc -n monitoring
kubectl get deployments -n monitoring

---------------------later

kubectl delete deployment,svc,pod,cm,secret -n monitoring --all
kubectl delete namespace monitoring

---- redeploy
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring
helm install prometheus-stack prometheus-community/kube-prometheus-stack -n monitoring
kubectl get pods -n monitoring
kubectl get svc -n monitoring
kubectl get deployments -n monitoring
kubectl port-forward svc/prometheus-stack-grafana -n monitoring 3000:80

## Install promtheus

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
 --namespace monitoring \
 --create-namespace

## Install grafana

helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm install grafana grafana/grafana \
 --namespace monitoring

## Port forward

kubectl port-forward svc/grafana 3000:80 --namespace monitoring

## Get admin password

kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode

## Prometheus url

http://prometheus-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090

Dashboard ids
315
15758
6417

13639
15141

--ELK Stack
helm uninstall elasticsearch -n logging

helm install elasticsearch elastic/elasticsearch -n logging \
 --set replicas=1 \
 --set volumeClaimTemplate.storageClassName=gp2 \
 --set volumeClaimTemplate.resources.requests.storage=10Gi

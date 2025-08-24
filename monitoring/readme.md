update the /etc/kubernetes/manifests/kube-apiserver.yaml - if using fluentd as log shipper

-- promtail
kubectl apply -f promtail.yaml
kubectl delete pod -n monitoring -l app=promtail
delete and restart if there is connection refused

http://loki:3100
datasource url but this doenst pass the test however it worked
{namespace="default"} - sample loki query

kubectl port-forward -n monitoring service/grafana 3000:80 &

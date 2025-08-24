hpa depends on the metrics server
kubectl get deployment metrics-server -n kube-system
if the server is not there
installing it here
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

troubleshooting the metrics server
if not running 0/1
kubectl edit deployment metrics-server -n kube-system
containers:

- name: metrics-server
  image: k8s.gcr.io/metrics-server/metrics-server:v0.6.4
  args: - --cert-dir=/tmp - --secure-port=4443 - --kubelet-insecure-tls \***\*\*\*\*** - --kubelet-preferred-address-types=InternalIP,Hostname,ExternalIP \***\*\*\*\*** \***\*\*\*\***-add these lines

HPA objects must be in the same namespace as the deployment they target.
kubectl apply -f hpa.yaml -n default

installing the vpa

Same rule as HPA: VPA objects must be in the same namespace as the deployment they target.
kubectl apply -f vpa.yaml -n default

reference
https://www.apptio.com/topics/kubernetes/autoscaling/vertical/?src=kc-com

---

fixing the vpa controller issue
https://chatgpt.com/c/68aaae21-3834-832e-955d-15408afc25c1

mkdir -p /tmp/vpa-certs
cd /tmp/vpa-certs

# Generate private key

openssl genrsa -out tls.key 2048

# Generate self-signed certificate (adjust CN if needed)

openssl req -x509 -new -nodes -key tls.key -subj "/CN=vpa-admission-controller.kube-system.svc" -days 365 -out tls.crt

kubectl create secret generic vpa-tls-certs \
 --from-file=tls.crt=/tmp/vpa-certs/tls.crt \
 --from-file=tls.key=/tmp/vpa-certs/tls.key \
 -n kube-system

kubectl delete pod -l app=vpa-admission-controller -n kube-system

kubectl get pods -n kube-system | grep vpa
kubectl describe pod <pod-name> -n kube-system

---

Testing the HPA
kubectl get pods -n default

Generate the cpu load in the backend container
kubectl exec -it notes-backend-674f5cf4b5-dktfl -- /bin/sh

# Busy loop to consume CPU inside the container

while true; do :; done

watch the cluster pods scaling up by this
kubectl get hpa -n default -w
kubectl get pods -n default

can see from the dashboard just use the command minikube dashboard

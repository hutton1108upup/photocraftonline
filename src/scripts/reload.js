const updates = new EventSource('/__reload');
updates.onmessage = () => window.location.reload();
window.addEventListener('beforeunload', () => updates.close());

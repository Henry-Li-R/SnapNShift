export function fetchWithAuth({ url, alertUser = true, options = {} }) {
  const token = localStorage.getItem("snapnshift-token");

  const headers = {
    ...(options.headers || {}),
    ...(token && {Authorization: `Bearer ${token}`}),
    "Content-Type": "application/json",
  };

  return fetch(url, { ...options, headers }).then((res) => {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("snapnshift-token");
      if (alertUser) {
        alert("Session expired. Please refresh and login again.");
      }
      throw new Error("No valid session.");
    }
    return res;
  });
}
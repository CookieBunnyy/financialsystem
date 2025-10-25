export async function fetchUsers() {
  try {
    const res = await fetch("http://localhost:8080/api/users", {
      cache: "no-store", // hmmmm ensures fresh data
    });

    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

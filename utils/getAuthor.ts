export default async function GetAuthor(userId: string) {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/getUser`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );

    // console.log("RES FROM FRONTEND", response);
    const data = await response.json();

    // if (error) {
    //   console.log("ERROR FROM FRONTEND", error);
    //   return error;
    // }

    return data;
  } catch (error) {
    console.log("ERROR FROM FETCHING USER", error);
    return error;
  }
}

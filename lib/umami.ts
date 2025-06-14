const username = process.env.UMAMI_USERNAME;
const password = process.env.UMAMI_PASSWORD;
const umamiurl = process.env.UMAMI_URL

const getAccessToken = async () => {
  const response = await fetch(
    umamiurl,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    },
  );

  return response.json();
};
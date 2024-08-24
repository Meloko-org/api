require('dotenv').config();

const getTestingKey = async () => {
  const response = await fetch('https://api.clerk.com/v1/testing_tokens', {
    method: 'POST',
    headers: {Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`}
  })

  const data = await response.json()
  const temp_testing_key = data.token

  return temp_testing_key
}

module.exports = {
  getTestingKey
}
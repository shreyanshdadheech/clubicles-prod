// Simple test to debug the reviews issue

async function testReviews() {
  console.log('Testing reviews API...')
  
  try {
    const response = await fetch('http://localhost:3002/api/spaces/42f0aa87-790c-4234-9931-90049f701649')
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers))
    
    if (response.ok) {
      const data = await response.json()
      console.log('API Response:', JSON.stringify(data, null, 2))
      
      if (data.space && data.space.reviews) {
        console.log('Reviews found:', data.space.reviews.length)
        data.space.reviews.forEach((review, index) => {
          console.log(`Review ${index + 1}:`, {
            id: review.id,
            rating: review.rating,
            comment: review.comment?.substring(0, 50) + '...',
            users: review.users
          })
        })
      } else {
        console.log('No reviews found in response')
      }
    } else {
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
  } catch (error) {
    console.error('Request failed:', error)
  }
}

testReviews()

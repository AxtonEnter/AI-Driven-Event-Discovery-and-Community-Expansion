import { useState } from 'react'
import './App.css'
import { Page } from './common/Page'
import { Box } from '@mui/material'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Page>
      <Box>
        {/* actions go here */}
      </Box>
      <Box>
        
      </Box>
    </Page>
  )
}

export default App

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { List } from './Splits/List'

export const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <List />
    </DndProvider>
  )
}

export default App
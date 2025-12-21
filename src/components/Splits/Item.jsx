//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React, { useState, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ItemModal } from './ItemModal'
import { GoTrash } from "react-icons/go";
import { TbArrowMoveUp, TbArrowMoveDown } from "react-icons/tb";
import '../../styles/style.scss'

export const Item = ({ index, listSize, unmaskPaths, itemData, moveListItem, removeListItem }) => {

    // useDrag - the list item is draggable
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);
    const [{ isDragging }, dragRef] = useDrag({
        type: 'item',
        item: { index },
        canDrag: isDraggingEnabled,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    // useDrop - the list item is also a drop area
    const [spec, dropRef] = useDrop({
        accept: 'item',
        hover: (item, monitor) => {
            const dragIndex = item.index
            const hoverIndex = index
            const hoverBoundingRect = ref.current?.getBoundingClientRect()
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            const hoverActualY = monitor.getClientOffset().y - hoverBoundingRect.top

            // if dragging down, continue only when hover is smaller than middle Y
            if (dragIndex < hoverIndex && hoverActualY < hoverMiddleY) return
            // if dragging up, continue only when hover is bigger than middle Y
            if (dragIndex > hoverIndex && hoverActualY > hoverMiddleY) return

            moveListItem(dragIndex, hoverIndex)
            item.index = hoverIndex
        },
    })

    //Move + Remove item functions
    const moveItemUp = (event) => {
        event.stopPropagation()
        moveListItem(index, index-1)
        index -= 1
    }
    const moveItemDown = (event) => {
        event.stopPropagation()
        moveListItem(index, index+1)
        index += 1
    }
    const removeItem = (event) => {
        event.stopPropagation()
        removeListItem(index)
    }

    //Modal functions that disable dragging
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => {
        setIsDraggingEnabled(false)
        setIsModalOpen(true)
    }
    const closeModal = () => {
        setIsDraggingEnabled(true)
        setIsModalOpen(false)
    }

    // Join the 2 refs together into one (both draggable and can be dropped on)
    const ref = useRef(null)
    const dragDropRef = dragRef(dropRef(ref))

    return (
        <React.Fragment>
            
            {/*Make items being dragged transparent, so it's easier to see where we drop them*/}
            <div onClick={!isModalOpen ? openModal : undefined} ref={dragDropRef} className={[
                "list-entry", 
                isModalOpen ? "defaultCursor" : "moveCursor", 
                isDragging ? "itemDrag" : "itemNoDrag"
                ].join(" ")}
                title="Click here to open contents for this entry">
                <span className="list-entry-text">{itemData.runName}</span><br/>
                <button className = {"list-icon" + (index == 0 ? " list-icon-disabled" : " list-icon-active")} onClick={moveItemUp} disabled={index==0} title="Move this file up one spot in your entries">
                    <TbArrowMoveUp />
                </button>
                <button className = {"list-icon" + (index == listSize-1 ? " list-icon-disabled" : " list-icon-active")} onClick={moveItemDown} disabled={index==listSize-1} title="Move this file down one spot in your entries">
                    <TbArrowMoveDown />
                </button>
                <button className = "list-icon list-icon-active" onClick={removeItem} title="Remove this file from your entries">
                    <GoTrash />
                </button>
                {isModalOpen && <ItemModal
                    itemData={itemData}
                    index={index}
                    unmaskPaths={unmaskPaths}
                    closeModal={closeModal}
                />}
            </div>
        </React.Fragment>
    )
}
//Based on: https://stackblitz.com/edit/vitejs-vite-yq3sun?file=src%2FApp.jsx
import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItemModal } from './ItemModal'
import { IconButton } from '../Inputs/IconButton.jsx'
import { BiWindowOpen } from "react-icons/bi";
import { GoTrash } from "react-icons/go";
import { GrDuplicate } from "react-icons/gr";
import { MdOutlineCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { TbArrowMoveUp, TbArrowMoveDown } from "react-icons/tb";
import '../../styles/style.scss'

export const Item = ({ id, index, listSize, unmaskPaths, canDownload, itemData, moveListItem, addListItem, removeListItem, toggleListItemSelection }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id, disabled: isModalOpen });
    const animation = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, cursor: !isModalOpen ? (isDragging ? 'grabbing' : 'grab') : "default" };
    
    //Modal functions to open up information about the file
    const openModal = (event) => {
        event.stopPropagation()
        setIsModalOpen(true)
    }
    const closeModal = () => {
        setIsModalOpen(false)
    }
    
    //Move + Remove item functions
    const moveItemUp = (event, canMove) => {
        if(canMove){
            event.stopPropagation()
            moveListItem(index, index-1)
            index -= 1
        }
    }
    const moveItemDown = (event, canMove) => {
        if(canMove){
            event.stopPropagation()
            moveListItem(index, index+1)
            index += 1
        }
    }
    const addItem = (event) => {
        event.stopPropagation()
        addListItem(itemData)
    }
    const removeItem = (event) => {
        event.stopPropagation()
        removeListItem(index)
    }

    //Toggle selection for item
    const toggleItemSelection = (event, value) => {
        event.stopPropagation()
        toggleListItemSelection(index, value)
    }

    return (
        //Item contents
        <div ref={setNodeRef} style={animation} {...attributes} {...listeners} className={"list-entry" + (itemData.isSelected ? " list-entry-selected" : "")} title="Click to drag this entry to another position">
        <span className="list-entry-text">
            {itemData.runName + (itemData.initialRepeats != 0 ? " (" + itemData.initialRepeats.toString() + ")" : "")}
        </span><br/>
        <IconButton
            entryButton={true}
            classes={"list-icon" + (index == 0 ? " list-icon-disabled" : " list-icon-active")}
            action={(event) => moveItemUp(event, index != 0)}
            disableCon={index == 0}
            description={"Move this file down one spot in your entries"}
            icon={<TbArrowMoveUp />}
        />
        <IconButton
            entryButton={true}
            classes={"list-icon" + (index == listSize-1 ? " list-icon-disabled" : " list-icon-active")}
            action={(event) => moveItemDown(event, index != listSize-1)}
            disableCon={index == listSize-1}
            description={"Move this file down one spot in your entries"}
            icon={<TbArrowMoveDown />}
        />
        <IconButton
            entryButton={true}
            classes={"list-icon list-icon-active"}
            action={(event) => toggleItemSelection(event, addItem(event))}
            description={"Add a duplicate of this file to the end of your entries"}
            icon={<GrDuplicate />}
        />
        <IconButton
            entryButton={true}
            classes={"list-icon list-icon-active"}
            action={(event) => toggleItemSelection(event, removeItem(event))}
            description={"Remove this file from your entries"}
            icon={<GoTrash />}
        />
        <IconButton
            entryButton={true}
            classes={"list-icon list-icon-active"}
            action={(event) => toggleItemSelection(event, openModal(event))}
            description={"Open important contents for this entry"}
            icon={<BiWindowOpen />}
        />
        <IconButton
            entryButton={true}
            classes={"list-icon list-icon-active"}
            action={(event) => toggleItemSelection(event, !itemData.isSelected)}
            description={(!itemData.isSelected ? "Select" : "Unselect") + " this entry"}
            icon={itemData.isSelected ? <MdOutlineCheckBox /> : <MdCheckBoxOutlineBlank />}
        />
        {isModalOpen && <ItemModal
            itemData={itemData}
            index={index}
            unmaskPaths={unmaskPaths}
            canDownload={canDownload}
            closeModal={closeModal}
        />}
        </div>
    );
};
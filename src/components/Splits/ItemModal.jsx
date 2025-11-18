import React, { useRef } from 'react'
import styles from '../../styles/style.module.css'

export const ItemModal = ({  name, text, closeModal }) => {
    
    return (
            //Modal div upon item click
            <React.Fragment>
                <div className = {styles.modal}>
                    <div className={styles.entry}>
                        <h2>Filename: {name}</h2>
                        <p>Contents: {text}</p>
                        <button type ='button' onClick={closeModal}>Close Modal</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }
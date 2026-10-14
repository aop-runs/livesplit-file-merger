import { iconCache } from "./livesplit";
import defaultIcon from '../assets/icon-error.jpg'; 

//Convert icon stored in LiveSplit file into binary stream that can be partially extracted to form a JPG, PNG, BMP, or GIF
export function gatherIconFromStream(iconID){
    
    //Convert icon data into binary stream
    let binaryString = atob(iconCache[parseInt(iconID) - 1]);
    let stream = new Uint8Array(binaryString.length);
	for(let i = 0; i < binaryString.length; i++){
		stream[i] = binaryString.charCodeAt(i);
	}

    //Determine image based on whehter a certain file type can be extracted
    let MIMESuffix = "";
    let imageBytes = null;
    for(let i = 0; i <= 3; i++){
        switch(i){
            case 0:
                imageBytes = extractPNG(stream);
                MIMESuffix = "png";
                break;
            case 1:
                imageBytes = extractBMP(stream);
                MIMESuffix = "bmp";
                break;
            case 2:
                imageBytes = extractGIF(stream);
                MIMESuffix = "gif";
                break;
            case 3:
                imageBytes = extractJPG(stream);
                MIMESuffix = "jpg";
                break;
        }
        if(imageBytes !== null){
            break;
        }
    }

    //Return default icon if a valid filetype could not be extracted or if an error occurred somewhere; Otherwise create a new object url from image bytes with its respective MIME
    if(imageBytes === null){
        return defaultIcon;
    }
    return URL.createObjectURL(new Blob([imageBytes], { type: 'image/' + MIMESuffix }));
}

//Extract a JPG image from a binary stream
function extractJPG(stream){

    //Scan for magic bytes and return null if they are not found
    let startIn = -1;
	let endIn = -1;
    for(let i = 0; i < stream.length - 1; i++){
        if(startIn == -1 && stream[i] === 0xFF && stream[i + 1] === 0xD8) {
            startIn = i;
        }
        if(startIn != -1 && stream[i] === 0xFF && stream[i + 1] === 0xD9) {
            endIn = i + 2;
            break;
        }
    }
	if(startIn == -1 || endIn == -1) {
		return null;
	}
    return stream.subarray(startIn, endIn);
}

//Extract a PNG image from a binary stream
function extractPNG(stream){

    //Scan for magic bytes and return null if they are not found
    const pngStart = [137, 80, 78, 71, 13, 10, 26, 10];
	const endMarker = [73, 69, 78, 68];
    let startIn = -1;
	let endIn = -1;
    for(let i = 0; i <= stream.length - pngStart.length; i++){
		if(pngStart.every((byte, index) => stream[i + index] === byte)){
		  startIn = i;
		  break;
		}
	}
    if(startIn == -1){
		return null;
	}
    for(let i = startIn; i <= stream.length - endMarker.length; i++){
		if(endMarker.every((byte, index) => stream[i + index] === byte)){
		  endIn = i;
		  break;
		}
	}
    if(endIn == -1){
		return null;
	}
    else{
        endIn += endMarker.length + 4;
    }
    return stream.subarray(startIn, endIn);
}

//Extract a BMP image from a binary stream
function extractBMP(stream){

    //Scan for magic bytes and return null if they are not found
    for(let i = 0; i < stream.length - 13; i++){
        if(stream[i] === 0x42 && stream[i + 1] === 0x4D){
            const view = new DataView(
                stream.buffer,
                stream.byteOffset + i,
                stream.length - i
            );
            const fileSize = view.getUint32(2, true);
            if(fileSize >= 14 && fileSize <= stream.length - i){
                return stream.slice(i, i + fileSize);
            }
        }
    }
    return null;
}

//Extract a GIF image from a binary stream
function extractGIF(stream){

    //Scan for magic bytes and return null if they are not found
    let startIn = -1;
	let endIn = -1;
    for(let i = 0; i < stream.length - 5; i++){
        if(stream[i] === 0x47 && stream[i+1] === 0x49 && stream[i+2] === 0x46 && stream[i+3] === 0x38){
            if((stream[i+4] === 0x37 || stream[i+4] === 0x39) && stream[i+5] === 0x61){
                startIn = i;
                break;
            }
        }
    }
    if(startIn == -1){
        return null;
    }
    for(let i = startIn + 6; i < stream.length; i++){
        if(stream[i] === 0x3B){
            endIn = i; 
        }
    }
    if(endIn == -1){
		return null;
	}
    else{
        endIn += 1;
    }
    return stream.subarray(startIn, endIn);
}
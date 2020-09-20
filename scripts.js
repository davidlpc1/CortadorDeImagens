const $photoInput = document.querySelector('#photo-file');
let photoPreview = document.querySelector('#photo-preview')
let image;
let photoName;

// Select Image from Input and Preview

document.querySelector('#select-image')
    .onclick = function(){
        $photoInput.click()
    }

window.addEventListener('DOMContentLoaded', () => {
    $photoInput.addEventListener('change',() => {
        let img_file = $photoInput.files.item(0)

        photoName = img_file.name;

        let reader = new FileReader()

        reader.readAsDataURL(img_file)
        reader.onload = event => {
            image = new Image();
            image.src = event.target.result
            image.onload = onLoadImage;
        }
    })
})

// Selection tool to manipulate Image
const selectionTool = document.querySelector('#selection-tool')
let startX, startY, relativeStartX , relativeStartY,
endX, endY, relativeEndX, relativeEndY;
let startSelection = false;

const eventsToManipulateImage = {
    mouseover(){
        this.style.cursor = 'crosshair'
    },
    mousedown(){
        const { clientX, clientY , offsetX, offsetY } = event

        startX = clientX
        startY = clientY 
        relativeStartX = offsetX 
        relativeStartY = offsetY

        startSelection = true;
    },
    mousemove(){
        endX = event.clientX
        endY = event.clientY

        if(startSelection){
            selectionTool.style.display = 'initial';
            selectionTool.style.top = `${startY}px`
            selectionTool.style.left = `${startX}px`

            selectionTool.style.width = `${endX - startX}px`;
            selectionTool.style.height = `${endY - startY}px`
        }

    },
    mouseup(){
        startSelection = false;

        relativeEndX = event.layerX;
        relativeEndY = event.layerY;

        cropButton.style.display = 'initial';
    }
}

Object.keys(eventsToManipulateImage)
.forEach( eventName => {
    photoPreview.addEventListener(eventName,eventsToManipulateImage[eventName])
})

// Canvas

let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

const onLoadImage = () => {
    const { width, height } = image
    canvas.width = width;
    canvas.height = height

    //Limpando o Contexto do Canvas
    ctx.clearRect(0, 0, width, height)

    // Desenhando a imagem no contexto do Canvas
    ctx.drawImage(image, 0, 0)

    photoPreview.src = canvas.toDataURL();
}

//Cortando a Image

const cropButton = document.getElementById('crop-image')
cropButton.onclick = () => {
    const { width: imgW, height: imgH} = image;
    const { width: previewW, height: previewH } = photoPreview

    const [ widthFactor, heightFactor] = [
        +(imgW / previewW),
        +( imgH / previewH)
    ]

    const [ selectionWidth, selectionHeight ] = [
        +selectionTool.style.width.replace('px', ''),
        +selectionTool.style.height.replace('px', '')
    ]

    const [ croppedWidth, croppedHeight ] = [
        +(selectionWidth * widthFactor),
        +(selectionHeight * heightFactor)
    ]

    const [ actualX , actualY] = [
        +( relativeStartX * widthFactor),
        +( relativeStartY * heightFactor)
    ]

    //Pegar do Contexto a imagem cortada
    const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight)

    ctx.clearRect(0 , 0,ctx.width, ctx.height)

    image.width = canvas.width = croppedWidth;
    image.height = canvas.height = croppedHeight;

    ctx.putImageData(croppedImage, 0 , 0)

    selectionTool.style.display = 'none';

    photoPreview.src = canvas.toDataURL();

    downloadButton.style.display = 'initial'
}

//Download da Imagem

const downloadButton = document.getElementById('download')
downloadButton.onclick = () => {
    const link = document.createElement('a')
    link.download = `${photoName}--cropped`;
    
    link.href = canvas.toDataURL();
    link.click()
}
// React + Web3 Essentials
import React, { Fragment, useCallback, useState } from "react";

// External Packages
import Cropper from "react-easy-crop";
import styledComponents from "styled-components";
import Resizer from "react-image-file-resizer";

type CropType = {
    x: number;
    y: number;
}

type CroppedAreaPixels = {
    height: number;
    width: number;
    x: number;
    y: number;
}

const AutoImageClipper = (props: { imageSrc: any; onImageCropped: any; width: any; height: any; }) => {
    const { imageSrc, onImageCropped, width, height } = props;
    const [crop, setCrop] = useState<CropType>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels|null>(null);
    const [croppedImage, setCroppedImage] = useState<string>('');
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    React.useEffect(() => {
        async function showCroppedImage() {
            try {
                if (imageSrc) {
                    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels!);
                    const image = await resizeFile(croppedImage);
                    onImageCropped(image);

                    return;

                } else {
                    return;
                }
            } catch (e) {
                console.error(e);

                return;
            }
        }
        showCroppedImage();
    }, [crop]);

    async function getCroppedImg(imageSrc:string, pixelCrop: { height: any; width: any; x: any; y: any; }) {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        canvas.width = pixelCrop?.width;
        canvas.height = pixelCrop?.height;
        const ctx = canvas.getContext("2d");
        const fileName = "none.jpg";

        ctx!.drawImage(
            image as CanvasImageSource,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        // As Base64 string
        // return canvas.toDataURL('image/jpeg');

        // As a blob
        return new Promise((resolve, reject) => {
            canvas.toBlob((file) => {
                //   resolve(URL.createObjectURL(file));
                resolve(
                    new File([file!], fileName, {
                        type: "image/jpeg",
                        lastModified: Date.now()
                    })
                );
            }, "image/jpeg");
        });
    }

    const resizeFile = (file: any) => {
        return new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                128,
                128,
                "JPEG",
                80,
                0,
                (uri) => {
                    resolve(uri);
                    setCroppedImage(uri as unknown as string);
                },
                "base64"
            );
        });
    };

    const createImage = (url: string) => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
            image.src = url;
        });
    };

    const onZoomChange = (zoom: React.SetStateAction<number>) => {
        setZoom(zoom);
    };
    return (
        <Container>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={onZoomChange}
                    style={{
                        containerStyle: {
                            width: width ? width : "0.1px",
                            height: height ? height : "0.1px",
                            position: "relative",
                            borderRadius: "16px"
                        }
                    }}
                />
            </Container>
    );
};

const Container = styledComponents.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;

export default AutoImageClipper;

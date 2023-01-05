import * as React from 'react';
import { extractIPFSHashFromImageURL, httpRequest } from '../../utilities';

type IPFSIconType = {
    icon: string | undefined
};

const IPFSIcon: React.FC<IPFSIconType> = ({
    icon
}) => {
    const [imageInBase64, setImageInBase64] = React.useState('');

    // fetch and pin the icons using ipfs hash
    React.useEffect(() =>{
        // extract the IPFS image url from the url of the icon
        const {type, url: ipfsHash} = extractIPFSHashFromImageURL(icon);
        if(!ipfsHash) return;
        // fetch the image directly from ipfs
        if(type === "http"){
            httpRequest(ipfsHash)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((res: any) => {
                setImageInBase64(res['icon']);
            })
            .catch((err) => {
                console.log(err);
            });
        }else{
            setImageInBase64(ipfsHash)
        }
    
    }, [icon]);

    return (
        <img
            style={{width: "100%", borderRadius: "8px"}}
            src={imageInBase64} alt=""
        />
    )
};

export default IPFSIcon;

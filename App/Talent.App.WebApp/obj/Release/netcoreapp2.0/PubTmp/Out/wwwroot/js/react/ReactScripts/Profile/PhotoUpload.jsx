import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { Button, Form, Grid, Icon, Input, Image, Label, Dropdown } from 'semantic-ui-react';
import AWS from 'aws-sdk';
import '@babel/polyfill';

export default class PhotoUpload extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedFile: null,
            selectedFileUrl: "",
            
        }

        this.fileChange = this.fileChange.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.renderPlaceholder = this.renderPlaceholder.bind(this);
        this.renderThumbnail = this.renderThumbnail.bind(this);
    };

    fileChange(event) {
       
        
        const acceptedExtensions = ['jpg', 'png', 'gif', 'jpeg'];
        const file = event.target.files[0];

        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            if (!acceptedExtensions.includes(fileExtension)) {
                alert("Please only select an image file with extensions 'jpg', 'png', 'gif', 'jpeg'");
                return;
            }

            this.setState({
                selectedFile: file,
                selectedFileUrl: URL.createObjectURL(file)
            });
        }


    }

    

    async uploadFile() {
        
        

        const awsAccessKeyId = 'AKIAVCTCWZ4Q7DK6I2H7';
        const awsSecretAccessKey = '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';
        const bucketName = 'talent-photo';
        const region = 'ap-southeast-2';

        const { selectedFile } = this.state;

        if (!selectedFile) {
            alert('Please select a file.');
            return;
        }

        // Configure AWS SDK for Browser
        AWS.config.update({
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey,
            region: region
        });

        const s3 = new AWS.S3();

        const params = {
            Bucket: bucketName,
            Key: selectedFile.name,
            Body: selectedFile,
            ACL: 'public-read' // Set ACL if needed
        };

        try {
            await s3.upload(params).promise();
            // Show notification or perform other actions upon successful upload
            alert('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }

        
        const l = 'https://talent-photo.s3.ap-southeast-2.amazonaws.com/' + this.state.selectedFile.name;
        
        this.props.saveProfileData(this.props.componentId, l)
        this.setState({
            selectedFile: null,
            selectedFileUrl: ''
        });
    }


    renderPlaceholder() {
        return (
            <div style={{ 'margin': '15px auto' }}>
                <div className='button'>
                    <label htmlFor='photo'>                                               
                        <Icon name="camera retro" circular size="huge" link />                        
                    </label>
                </div>
                <input
                    type="file"
                    id="photo"
                    hidden
                    onChange={this.fileChange}
                />
            </div>
        )
    }

    renderThumbnail() {
        const { imageUrl } = this.props;
        const { selectedFile, selectedFileUrl } = this.state;
        
        return (
            <div style={{ 'margin': '15PX auto' }}>
                <label htmlFor='photo'>
                    <Image src={selectedFileUrl ? selectedFileUrl : imageUrl} size="small" circular />                    
                    
                </ label>
                <input
                    type="file"
                    id="photo"
                    hidden
                    onChange={this.fileChange}
                />

                {
                    selectedFile ?
                        <Button type="button"
                            fluid
                            color="teal"
                            content="Upload"
                            onClick={this.uploadFile}
                            style={{ 'margin': '15PX auto' }}
                        />
                        :
                        null
                }
            </div>
        )
    }

    render() {
        const { imageUrl } = this.props
        const { selectedFileUrl } = this.state;

        if (!selectedFileUrl && !imageUrl) {
            return (
                this.renderPlaceholder()
            )
        }
        return (
            this.renderThumbnail()
        )
    }
} 








    





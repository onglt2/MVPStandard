import React from "react";
import Cookies from 'js-cookie';
import { ChildSingleInput } from '../Form/SingleInput.jsx';
import { Location } from '../Employer/CreateJob/Location.jsx';
import { Button, Icon, Popup } from 'semantic-ui-react';
export default class SocialMediaLinkedAccount extends React.Component {
    constructor(props) {
        super(props)

        const linkedAccounts = props.linkedAccounts ?
            Object.assign({}, props.linkedAccounts)
            : {               
                linkedIn: "",
                gitHub: ""         
              }

        this.state = {
            showEditSection: false,
            newContact: linkedAccounts
        }

        this.openEdit = this.openEdit.bind(this)
        this.closeEdit = this.closeEdit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.saveContact = this.saveContact.bind(this)
        this.renderEdit = this.renderEdit.bind(this)
        this.renderDisplay = this.renderDisplay.bind(this)
        
    }

    componentDidMount() {
        $('.ui.button.social-media')
            .popup();
    }

    openEdit() {
        const linkedAccounts = Object.assign({}, this.props.linkedAccounts)
        this.setState({
            showEditSection: true,
            newContact: linkedAccounts
        })
    }

    closeEdit() {
        this.setState({
            showEditSection: false
        })
    }

    handleChange(event) {
        const data = Object.assign({}, this.state.newContact)
        data[event.target.name] = event.target.value
        this.setState({
            newContact: data
        })
       
    }

    updateForComponentId(componentId, newValues) {
        let data = {};
        data[componentId] = newValues;
        this.props.saveProfileData(data)
        this.closeEdit()
    }

    
    saveContact() {
        
        const data = Object.assign({}, this.state.newContact)
        let ComponentId = 'linkedAccounts'
        this.updateForComponentId(ComponentId, data)         
    }

    render() {
        
        return (
            this.state.showEditSection ? this.renderEdit() : this.renderDisplay()
        )
    }

    renderEdit() {
        
        return (
            <div className='ui sixteen wide column'>
                <ChildSingleInput
                    inputType="text"
                    label="Linkedln"
                    name="linkedIn"                    
                    value={this.state.newContact.linkedIn}
                    controlFunc={this.handleChange}
                    maxLength={80}
                    placeholder="Enter your LinkedIn URL"
                    errorMessage="Please enter a valid URL"
                />

                <ChildSingleInput
                    inputType="text"
                    label="GitHub"
                    name="github"
                    value={this.state.newContact.github}
                    controlFunc={this.handleChange}
                    maxLength={80}
                    placeholder="Enter your GitHub URL"
                    errorMessage="Please enter a valid URL"
                />

                

                <button type="button" className="ui teal button" onClick={this.saveContact}>Save</button>
                <button type="button" className="ui button" onClick={this.closeEdit}>Cancel</button>
            </div>
        )
    }

    renderDisplay() {
        
        let linkedIn = this.props.linkedAccounts ? `${this.props.linkedAccounts.linkedIn}` : "";
        let gitHub = this.props.linkedAccounts ? `${this.props.linkedAccounts.github}` : "";
        
        

        return (
            <div className='row'>
                <div className="ui sixteen wide column">
                    <React.Fragment>
                        <Button color='linkedin' as="a" href={linkedIn} target="_blank">
                         <Icon name='linkedin' /> LinkedIn
                        </Button>
                        <Button color='black' as="a" href={gitHub} target="_blank">
                            <Icon name='github' /> GitHub
                        </Button>
                        
                        
                    </React.Fragment>
                    <button type="button" className="ui right floated teal button" onClick={this.openEdit}>Edit</button>
                </div>
            </div>
        )
    }
}
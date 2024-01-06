import React, { Component } from 'react';
import Cookies from 'js-cookie'
import { ChildSingleInput } from '../Form/SingleInput.jsx';
import Joi from 'joi-browser';

export default class SelfIntroduction extends React.Component {
    constructor(props) {
        super(props);

        this.state = {            
            data: {
                summary: '',
                description: '',
            },
        };

        this.schema = {
            summary: Joi.string().max(150).label('Summary'),
            description: Joi.string().min(150).max(600).label('Description'),
        }

        this.handleChange = this.handleChange.bind(this)
        this.saveData = this.saveData.bind(this)
        this.validate = this.validate.bind(this)
    };

    componentDidMount() {
       this.loadData();
    }

    componentDidUpdate(prevProps) {
        if (this.props.summary !== prevProps.summary || this.props.description !== prevProps.description) {
            this.loadData();
        }
    }

    loadData() {
        this.setState({
            data: {
                summary: this.props.summary,
                description: this.props.description
            },
        });
        
        
    }

    validate() {
        const result = Joi.validate(this.state.data, this.schema);
        return result;
    }

    

    handleChange(event) {
        const { data } = this.state
        data[event.target.name] = event.target.value
        this.setState({ data })
    }

    saveData() {
        const result = this.validate()
        if (result.error) {
            const errorMessage = result.error.details[0].message;
            TalentUtil.notification.show(errorMessage, "error", null, null)
        }
        else {
            const { data } = this.state
            this.props.updateProfileData(data)
            
        }
    }


    render() {                   

        return (
            <div className='ui sixteen wide column'>
                <ChildSingleInput
                    inputType="text"
                    name="summary"
                    value={this.state.data.summary}
                    controlFunc={this.handleChange}                    
                    placeholder="Please provide a short summary about yourself."
                    errorMessage="Please enter a valid summary"
                />
                <p> Summary must be no more than 150 characters. </p>
                <textarea
                    name="description"
                    value={this.state.data.description}
                    onChange={this.handleChange}                    
                    placeholder="Please tell us about any hobbies, addtional experties, or anything else you'd like to add."
                />
                <p> Description must be between 150-600 characters. </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  
                    <button type="button" className="ui teal button" onClick={this.saveData} style={{ marginLeft: 'auto' }}>Save</button>
                </div>

                
            </div>
        )
    }


}        

        
    





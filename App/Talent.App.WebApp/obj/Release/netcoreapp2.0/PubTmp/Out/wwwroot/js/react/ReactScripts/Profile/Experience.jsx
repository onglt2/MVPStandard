import React from 'react';
import Cookies from 'js-cookie';
import { Button, Grid, Label, Icon, Table, Form } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import DateInput from 'semantic-ui-calendar-react';

export default class Experience extends React.Component {
    constructor(props) {
        super(props);
        
        const exp = props.experienceData ? props.experienceData : [{ company: "", position: "", responsibilities: "", start: null, end: null, id: "", userId: "", isDeleted: "" }]


        this.state = {     
            start: '',
            sdate: {},
            showEditSection: false,
            experienceData: exp,  
            show: false,
            id: 1,
            addrow: false,                       
            newExp: {
                company: "",
                position: "",
                responsibilities: "",
                start: null,
                end: null,
                id: "", userId: "", isDeleted: "" 
            }

        }

        this.addDisplay = this.addDisplay.bind(this)
        this.closeDisplay = this.closeDisplay.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleChangeDate = this.handleChangeDate.bind(this)
        this.loadData = this.loadData.bind(this);
        this.addRecord = this.addRecord.bind(this)
        this.updateExperience = this.updateExperience.bind(this);
        this.deleteExperience = this.deleteExperience.bind(this);
        this.formatDate = this.formatDate.bind(this);  
        this.handleDateChange = this.handleDateChange.bind(this);
    };
    
    componentDidUpdate(prevProps) {
                
        if (this.props.experienceData !== prevProps.experienceData) {
                    
        }
    }

    componentDidMount() {
        
        this.loadData();

    }

    loadData() {
        return new Promise((resolve, reject) => {

            var link = 'https://mvpstandard-p.azurewebsites.net/profile/profile/getExperience'
            

            var cookies = Cookies.get('talentAuthToken');
            $.ajax({
                url: link,
                headers: {
                    'Authorization': 'Bearer ' + cookies,
                    'Content-Type': 'application/json'
                },
                type: "GET",
                contentType: "application/json",
                dataType: "json",
                success: function (res) {
                    if (res.success == true) {
                        this.setState({
                            experienceData: res.data,
                            show: false
                        }, () => resolve());                       
                                                
                    }
                }.bind(this),
                error: function (res, a, b) {
                    console.log(res);
                    console.log(a);
                    console.log(b);
                    reject();

                }
            });
        });
        
    }

    addDisplay(e) {
        e.preventDefault();
        this.setState({ show: true });
    }

    closeDisplay(e) {

        e.preventDefault();
        
        this.setState({
            show: false
        })


    }

    handleChange(event) {
        
        const data = Object.assign({}, this.state.newExp)
        data[event.target.name] = event.target.value
        
        let value = event.target.value
        

        this.setState({
            newExp: data,

        })

        
    }

    handleDateChange(event, { name, value }) {
        if (this.state.hasOwnProperty(name)) {
            this.setState({ [name]: value });
        }
        
    }

            
        
   handleChangeDate(date, name) {
        var data = Object.assign({}, this.state.newExp);
        
       data[name] = date;
        this.setState({
            newExp: data,
        })
        
    }

    

    addRecord() {

        const l = this.props.experienceData;
                       
        if (this.state.newExp.company == "" || this.state.newExp.position == "") {
            alert("company and position cannot be empty");
            return;
        }

        if (this.state.newExp.start > this.state.newExp.end) {
            alert("End date must be later than start end");
            return;
        }

        var h = this.state.newExp;
        
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'https://mvpstandard-p.azurewebsites.net/profile/profile/addExperience',
            
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(h),
            success: function (res) {
                
                if (res.success == true) {
                    TalentUtil.notification.show("Experience added sucessfully", "success", null, null)
                    this.loadData().then(() => { // Load data after state has been updated
                        this.props.updateProfileData(this.props.componentId, this.state.experienceData);
                    });                                         
                                        

                } else {
                    TalentUtil.notification.show("Experience did not update successfully", "error", null, null)
                }

            }.bind(this),
            error: function (res, a, b) {
                console.log(res)
                console.log(a)
                console.log(b)
            }
        });              

        this.setState({
            newExp: {
                company: "",
                position: "",
                responsibilities: "",
                start: null,
                end: null
            },
        });

    }


    updateExperience(data) {        
        
        const l = this.state.experienceData;
        if (data.company == "" || data.position == "") {
            alert("pls fill update");
            return;
        }

        if (data.start > data.end) {
            alert("End date must be later than start end");
            return;
        } 

        
        var result = l.findIndex(item => item.id == data.id)
        
        l[result] = data;
       
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'https://mvpstandard-p.azurewebsites.net/profile/profile/updateExperience',
            
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(data),
            success: function (res) {
                
                if (res.success == true) {
                    TalentUtil.notification.show("Experience updated sucessfully", "success", null, null)
                    this.setState({
                        newExp: {
                            company: "",
                            position: "",
                            responsibilities: "",
                            start: null,
                            end: null },
                        experienceData: l,
                        show: false,
                    })

                } else {
                    TalentUtil.notification.show("Experience did not update successfully", "error", null, null)
                }

            }.bind(this),
            error: function (res, a, b) {
                console.log(res)
                console.log(a)
                console.log(b)
            }
        })


        this.props.updateProfileData(this.props.componentId, l)

    }

    deleteExperience(item) {
        var cookies = Cookies.get('talentAuthToken');
        const l = this.state.experienceData;                            

        var index = l.findIndex(x => x.id == item.id)
        
        l.splice(index, 1);
        

        $.ajax({
            url: 'https://mvpstandard-p.azurewebsites.net/profile/profile/deleteExperience',
            
            headers: {
            'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
        },
        type: "POST",
            data: JSON.stringify(item),
                success: function (res) {
                    
                    if (res.success == true) {
                        TalentUtil.notification.show("Experience deleted sucessfully", "success", null, null)
                    } else {
                        TalentUtil.notification.show("Experience not deleted successfully", "error", null, null)
                    }

                }.bind(this),
                    error: function (res, a, b) {
                        console.log(res)
                        console.log(a)
                        console.log(b)
                    }
    })

        this.props.updateProfileData(this.props.componentId, l)

  }

    formatDate(string) {
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        return new Date(string).toLocaleDateString([], options);
    }

    formatDateU(string) {

        return new Date(string).toLocaleDateString("en-GB");
    }

    

    render() {

        return (
            this.renderDisplay()
        )
        
    }    


    renderDisplay() {
        
        const expDetails = this.state.newExp;
        
        var rows = [];
        
        let exp = this.state.experienceData;
        
        if (exp != null || exp != undefined) {
            for (var i = 0; i < exp.length; i++) {
                
                rows.push(
                    <ExperienceRow key={exp[i].id} item={exp[i]} openTable={this.openTable} updateExperience={this.updateExperience} deleteExperience={this.deleteExperience} />)
            }
            
        }      

        let isState = this.state.show;
        let options = [];

        if (isState) {           

            
            let i = length > 0 ? length : 1            
            options =
                <div>
                    <div className="fields">
                        <div className="ui eight wide field">
                            Company
                            <input type="text"
                                value={expDetails.company}
                                name="company"
                                id="company"
                                placeholder="Company"
                                onChange={this.handleChange}
                            />
                        </div>

                        <div className="ui eight wide field">
                            Position
                            <input type="text"
                                value={expDetails.position}
                                name="position"
                                id="position"
                                placeholder="Position"
                                onChange={this.handleChange}
                            />
                        </div>
                    </div>


                    <div className="fields">
                        <div className="ui eight wide field">
                            Start Date
                            
                            
                            <DatePicker 
                                selected={expDetails.start}                                
                                onChange={(date) => this.handleChangeDate(date, "start")}
                                peekNextMonth
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                locale="en-GB"
                            />
                        </div>
                        <div className="ui eight wide field">
                            End Date
                            
                            <DatePicker 
                                //value={expDetails.end}
                                selected={expDetails.end}
                                onChange={(date) => this.handleChangeDate(date, "end")}
                                peekNextMonth
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                locale="en-GB"
                            />

                        </div>
                    </div>
                    <div className="fields">
                        <div className="ui sixteen wide field">
                            Responsibilities
                            <input type="text"
                                value={expDetails.responsibilities}
                                name="responsibilities"
                                id="enddate"
                                placeholder="Responsibilities"
                                onChange={this.handleChange}
                            />
                        </div>
                    </div>

                    <div className="fields">
                        <br />
                        <div className="field">
                            <Button color="black" onClick={() => this.addRecord(i)}>Add</Button>
                        </div>
                        <div className="field">
                            <Button color="grey" onClick={this.closeDisplay}>Cancel</Button>
                        </div>
                    </div>
                </div>

        }

        
        return (
            <div className='ui sixteen wide column'>
                {options}

                <div className="fields">
                    
                            <Table unstackable >
                                <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Company</Table.HeaderCell>
                                <Table.HeaderCell>Position</Table.HeaderCell>
                                <Table.HeaderCell>Responsibilities</Table.HeaderCell>
                                <Table.HeaderCell>Start</Table.HeaderCell>
                                <Table.HeaderCell>End</Table.HeaderCell>
                                <Table.HeaderCell textAlign='right'>
                                    <Button color="black" onClick={this.addDisplay}>
                                        <Icon name='plus' />
                                        Add New </Button>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {rows}
                        </Table.Body>
                    </Table>
                </div>
            </div>


        )      

    }
}

export class ExperienceRow extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            date: '',
            sdate: moment(), 
            edate: moment(),
            focused: false, 
            newExp: {
                company: "",
                position: "",
                responsibilities: "",
                start: null,
                end: null,
                id: "", userId: "", isDeleted: ""
            },
            
            showP: false
            
        }


        this.updateExperience = this.updateExperience.bind(this);
        this.deleteExperience = this.deleteExperience.bind(this);
        this.updateOpen = this.updateOpen.bind(this);
        this.updateClose = this.updateClose.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this)
        this.formatDate = this.formatDate.bind(this);
        this.formatDateU = this.formatDateU.bind(this);


    }

    handleDateChange (event) {
        if (this.state.hasOwnProperty(event.name)) {
            this.setState({ [event.name]: value });
        }
    }

    onDateChange () {
        this.setState({ date });
    };

    
    onFocusChange () {
        this.setState({ focused });
    };

    

    formatDateU(string) {

        return new Date(string).toLocaleDateString("en-GB");
    }


    formatDate(string) {
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        return new Date(string).toLocaleDateString([], options);
    }

    handleChangeDate(date, name) {
        var data = Object.assign({}, this.state.newExp);
        
        data[name] = date;
           
        
        this.setState({
            newExp: data,

        })
    }
    handleChange(event) {
        event.preventDefault();
        
        const data = Object.assign({}, this.state.newExp)

        data[event.target.name] = event.target.value
        
        this.setState({
            newExp: data
        })

    }



    updateClose(event) {
        event.preventDefault();
        
        this.setState({
            showP: false
        })

    }


    updateOpen(event) {
        event.preventDefault();
       
        this.setState({
            showP: true,
            newExp: this.props.item
        })
    }

    
    updateExperience(id, e) {
        
        const data = Object.assign({}, this.state.newExp)
        data.id = id;
        this.setState({
            showP: false,
            newExp: {
                company: "",
                position: "",
                responsibilities: "",
                start: null,
                end: null,
                id: "", userId: "", isDeleted: "" }
        })
        
        
        this.props.updateExperience(data);

    }

    deleteExperience(item) {
        
        this.props.deleteExperience(item);
    }

    formatDate (dateString) {
        
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        const suffix = this.getDateSuffix(day);
        const formattedDay = `${day}${suffix}`;

        return `${formattedDay} ${month}, ${year}`;
    };

    getDateSuffix (day) {
        if (day >= 11 && day <= 13) {
            return 'th';
        }
        switch (day % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    };

    render() {
        let status = this.state.showP
        
        return (

            status ? this.renderUpdate() : this.renderDisplay()

        )

    }

    renderUpdate() {

        const id = this.props.item.id;
                
        const expDetails = this.state.newExp;

        

        return (
            
        
            <Table.Row>
                <Table.Cell colSpan={6}>
                    <Table unstackable>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>
                                    <b>Company:</b>
                                    <input type="text"
                                        value={this.state.newExp.company}
                                        name="company"
                                        id="company"
                                        placeholder="Company"
                                        onChange={this.handleChange}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <b>Position:</b>
                                    <input type="text"
                                        value={this.state.newExp.position}
                                        name="position"
                                        id="position"
                                        placeholder="Position"
                                        onChange={this.handleChange}
                                    />
                                </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <b>Start Date:</b>
                                    <DatePicker 
                                        value={this.formatDateU(expDetails.start)}
                                        onChange={(date) => this.handleChangeDate(date, "start")}
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <b>End Date:</b>
                                    <DatePicker 
                                        value={this.formatDateU(expDetails.end)}
                                        onChange={(date) => this.handleChangeDate(date, "end")}
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                    />
                                </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell colSpan={6}>
                                    <b>Responsibilities:</b>
                                    <input type="text"
                                        value={expDetails.responsibilities}
                                        name="responsibilities"
                                        id="enddate"
                                        placeholder="Responsibilities"
                                        onChange={this.handleChange}
                                    />
                                </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell colSpan={6} textAlign='left'>
                                    <Button color="black" onClick={(e) => this.updateExperience(id, e)}>Update</Button>                                    
                                    <button className="ui button" onClick={this.updateClose}>Cancel</button>
                                </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </Table.Cell>
            </Table.Row>
        );

    }

    renderDisplay() {
        const item = this.props.item;

        return (<Table.Row>
            <Table.Cell>{item.company}</Table.Cell>
            <Table.Cell>{item.position}</Table.Cell>
            <Table.Cell>{item.responsibilities}</Table.Cell>
            <Table.Cell>{this.formatDate(item.start)}</Table.Cell>
            <Table.Cell>{this.formatDate(item.end)}</Table.Cell>
            {/*<Table.Cell>{item.start}</Table.Cell>*/}
            {/*<Table.Cell>{item.end}</Table.Cell>*/}

            <Table.Cell textAlign='right'>
                <Button onClick={this.updateOpen} >
                    <Icon name='pencil' />
                </Button>
                <Button onClick={() => this.deleteExperience(item)} >
                    <Icon name='x' />
                </Button>
            </Table.Cell>
        </Table.Row >

        )
    }
}

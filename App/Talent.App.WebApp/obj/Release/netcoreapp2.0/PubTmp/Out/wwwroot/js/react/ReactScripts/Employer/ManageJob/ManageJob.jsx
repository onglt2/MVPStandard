import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment } from 'semantic-ui-react';
import { Modal, Button, Grid, Card } from 'semantic-ui-react';
import moment from 'moment';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData;
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            loadJobs: [],
            list: [],
            tableData: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true                
            },
            totalPages: 1,
            activeIndex: "",
            jobTitle: "",
            showCard: true,
            itemsPerPage: 2,
            jobIdToClose: "",
            showModal: false,
            totalCount: 1,



        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.handleCloseClick = this.handleCloseClick.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);

        //your functions go here
    };



    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData);
        loaderData.isLoading = false;
        this.setState({ loaderData });//comment this

        //set loaderData.isLoading to false after getting data
        //this.loadData(() =>
        //    this.setState({ loaderData })
        //)

        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.loadData();
        this.init();
    };

    loadData(callback) {

        var link = 'https://mvpstandard-l.azurewebsites.net/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');
        var self = this;

        var queryParams = {
            activePage: this.state.activePage,
            sortbyDate: this.state.sortBy.date, // Replace with your actual sorting value
            showActive: this.state.filter.showActive,
            showClosed: this.state.filter.showClosed,
            showDraft: this.state.filter.showDraft,
            showExpired: this.state.filter.showExpired,
            showUnexpired: this.state.filter.showUnexpired,
        };

        // Use jQuery.param to serialize the query parameters
        var queryString = $.param(queryParams);

        // Append the query string to the URL
        var requestUrl = `${link}?${queryString}`;

        // your ajax call and other logic goes here
        $.ajax({
            /*url: 'http://localhost:51689/listing/listing/getSortedEmployerJobs',*/
            url: requestUrl,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (res) {
                let loadJobs = null;
                console.log(res);
                console.log(res.totalCount);

                if (res.myJobs) {

                    loadJobs = res.myJobs;
                    this.state.totalCount = res.totalCount;
                    
                }
                this.updateWithoutSave(loadJobs, callback);
            }.bind(this),
            error: function (res) {
                console.log(res.status)
            }
        })
        //console.log(this.state.loadJobs);
        //this.init()
    }

    updateWithoutSave(newData, callback) {
        //let newSD = Object.assign({}, this.state.loadJobs, newData);
        this.setState({
            //loadJobs: newSD
            loadJobs: newData,
        },
            () => {
                if (callback) {
                    callback(); // Call the callback function
                }
            }
        );


    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

    handlePageChange(event, data) {
        const { activePage } = data;
        this.setState({ activePage });
    }

total

    handleEditClick(jobId) {
        this.props.history.push(`/EditJob/${jobId}`);

    }


    handleCloseClick(jobId) {
        this.setState({ jobIdToClose: jobId, showModal: true, showjobcard: true }, () => {
            //console.log(this.state.showModal);
            //console.log(this.state.jobIdToClose);
            //console.log(this.state.showjobcard);

        });
    }



    renderJobCards() {

        const startIndex = (this.state.activePage - 1) * this.state.itemsPerPage;
        const endIndex = startIndex + this.state.itemsPerPage;
        const displayedItems = this.state.loadJobs.slice(startIndex, endIndex);

        function filterText(inputText) {
            // Use a regular expression to find and replace the text
            return inputText.replace(/<[^>]+>|&[^;]+;/g, '');
        }

        return (
            <Grid columns={2} >
                <Grid.Row >
                    {displayedItems.map((job, index) => (
                        <Grid.Column key={index}>

                            <Card style={{ width: '500px' }}>
                                <Card.Content>
                                    <a className="ui black right ribbon label"><Icon name='user' />0</a>
                                    <Card.Header>{job.title}<br></br><br></br></Card.Header>
                                    <Card.Meta>{job.location.city}, {job.location.country}<br></br><br></br></Card.Meta>
                                    <Card.Description>
                                        Job ID: <b>{job.id}</b>
                                        <br></br><br></br>
                                        {filterText(job.description)}
                                        <br></br><br></br>
                                        {job.summary}
                                        <br></br><br></br>
                                        Expiry: <b>{moment(job.expiryDate).format('DD MMMM YYYY')}</b>
                                        <br></br><br></br>

                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {moment(job.expiryDate).isBefore(moment(), 'day') && (
                                                <div style={{ flex: 1 }}>
                                                    <button className="ui red button">Expired</button>
                                                </div>
                                            )}

                                            {job.status === 1 && (
                                                <div style={{ flex: 1 }}>
                                                    <button className="ui red button">Closed</button>
                                                </div>
                                            )}

                                            <div style={{ flex: 2, textAlign: 'right' }}>
                                                <div className="ui buttons">
                                                    <button className="ui blue basic button" onClick={() => this.handleCloseClick(job.id)}><Icon name='close' />Close</button>
                                                    <button className="ui blue basic button" onClick={() => this.handleEditClick(job.id)}> <Icon name='edit outline' />Edit</button>
                                                    <button className="ui blue basic button"><Icon name='copy outline' />Copy</button>
                                                </div>
                                            </div>
                                        </div>

                                        <br></br>
                                    </Card.Description>
                                </Card.Content>
                            </Card>

                        </Grid.Column>
                    ))}
                    <br></br><br></br>

                </Grid.Row>

                <br></br><br></br>
            </Grid>
        );
    }

    closeJob(jobId) {
        var cookies = Cookies.get('talentAuthToken');

        $.ajax({
            url: 'https://mvpstandard-l.azurewebsites.net/listing/listing/closeJob',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            dataType: 'json',
            type: "post",
            data: JSON.stringify(jobId),

            success: function (res) {
                if (res.success == true) {
                    TalentUtil.notification.show(res.message, "success", null, null);
                    window.location = "/ManageJobs";

                } else {
                    TalentUtil.notification.show(res.message, "error", null, null)
                }

            }.bind(this),
        })


        // Close the modal
        this.handleCloseModal();
    }

    handleCloseModal() {
        this.setState({ showModal: false });

    }


    handleFilterChange(e, { name, checked }) {
        this.setState(prevState => {
            const updatedFilter = Object.assign({}, prevState.filter, {
                [name]: checked,
            });
            //console.log(updatedFilter.showClosed);
            return { filter: updatedFilter };
        }, () => {
            //console.log(this.state.filter.showClosed);
            this.loadData();
        });
    }





    handleSortChange(e, { value }) {
        // Update the sortBy state
        this.setState({
            sortBy: {
                date: value,
            },
        }, () => {
            // After the state is updated, load data with the updated sorting
            this.loadData();
        });
    }



    render() {

        const { loadJobs, activePage, itemsPerPage } = this.state;

        const { filter, sortBy } = this.state;

        const checkboxLabelStyle = {
            fontFamily: 'Arial', // Set your desired font here
            verticalAlign: 'middle', // Align text vertically in the middle
            margin: '10px' // Add margin for spacing
        };

        const labelStyle = {
            fontFamily: 'Arial', // Set your desired font here

        };

        const filterOptions = [
            { key: 'showActive', label: 'Show Active', value: 'showActive' },
            { key: 'showClosed', label: 'Show Closed', value: 'showClosed' },
            /*{ key: 'showDraft', label: 'Show Draft', value: 'showDraft' },*/
            { key: 'showExpired', label: 'Show Expired', value: 'showExpired' },
            { key: 'showUnexpired', label: 'Show Non-Expired', value: 'showUnexpired' },
        ];

        const sortOptions = [
            { key: 'newest', value: 'desc', text: 'Newest First' },
            { key: 'oldest', value: 'asc', text: 'Oldest First' },
        ];

        if (this.state.loadJobs.length === 0) {
            return <div>Loading...</div>;
        }


        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>

                <div className="ui container" >
                    <h1 style={{ margin: '0', paddingBottom: '0px' }}><b>List of Jobs</b></h1>
                    <br></br>
                    {/*<Icon name='filter' ></Icon>Filter: <b>Choose filter</b> <Icon name='calendar alternate' ></Icon>Sort by date: <b>Newest first</b> <br></br>*/}

                    <Form>

                        <div style={{ display: 'flex', alignItems: 'left' }}>
                            <label style={checkboxLabelStyle}><Icon name='filter' ></Icon>Filter: <b style={{ marginRight: '0px' }}>Choose filter</b></label>
                            {filterOptions.map((option) => (
                                <Form.Field
                                    key={option.value}
                                    control={Checkbox}
                                    label={option.label}
                                    name={option.value}
                                    checked={filter[option.value]}
                                    onChange={this.handleFilterChange}
                                    style={checkboxLabelStyle}
                                />
                            ))}
                        {/*</div>*/}
                        {/*<div style={{ display: 'flex', alignItems: 'left' }}>*/}
                            <label style={checkboxLabelStyle} >
                                <Icon name='calendar alternate' ></Icon>
                                Sort by date:
                            </label>

                            <Form.Select
                                options={sortOptions}
                                value={sortBy.date}
                                onChange={this.handleSortChange}
                                style={labelStyle}
                            />
                        </div>


                    </Form>


                    {this.state.loadJobs.length == 0 ? (
                        <h3>No Jobs Found</h3>

                    ) : (
                        <div>
                            {this.renderJobCards()}
                            <br></br><br></br>
                        </div>
                    )
                    }

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Pagination
                            activePage={activePage}
                            onPageChange={(event, data) => this.handlePageChange(event, data)}
                            //totalPages={Math.ceil(this.state.loadJobs.length / itemsPerPage)}
                            totalPages={this.state.totalCount / itemsPerPage}
                        />
                    </div>

                    <br></br><br></br>
                    {/*{this.state.showjobcard && (*/}
                    {/*    <JobSummaryCard jobIdToClose={this.state.jobIdToClose} showModal={this.state.showModal} />*/}
                    {/*)}*/}
                    {/*//{jobSummaryCard}*/}

                    <Modal
                        open={this.state.showModal}
                        onClose={this.handleCloseModal}
                        size="small"
                    >
                        <Modal.Header>Confirm Job Closure</Modal.Header>
                        <Modal.Content>
                            <p>Are you sure you want to close job with ID: <b>{this.state.jobIdToClose}</b>?</p>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button color="red" onClick={this.handleCloseModal}>
                                Cancel
                            </Button>
                            <Button color="green" onClick={() => this.closeJob(this.state.jobIdToClose)}>
                                Confirm
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </div>
            </BodyWrapper >
        )
    }
}


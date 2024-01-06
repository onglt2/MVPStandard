import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie'
import TalentCard from '../TalentFeed/TalentCard.jsx';
import { Loader, Icon, Container } from 'semantic-ui-react';
import CompanyProfile from '../TalentFeed/CompanyProfile.jsx';
import FollowingSuggestion from '../TalentFeed/FollowingSuggestion.jsx';
import { BodyWrapper, loaderData } from '../Layout/BodyWrapper.jsx';

export default class TalentFeed extends React.Component {
    constructor(props) {
        super(props);

        let loader = loaderData
        loader.allowedUsers.push("Employer")
        loader.allowedUsers.push("Recruiter")

        this.state = {
            loadNumber: 5,            
            loadPosition: 1179,
            feedData: [],
            watchlist: [],
            loaderData: loader,
            loadingFeedData: true,
            companyDetails: null
        }

        this.init = this.init.bind(this);
        this.loadFeedData = this.loadFeedData.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        this.setState({ loaderData });
        this.loadFeedData();
    }

    handleScroll() {
        const win = $(window);
        if ((($(document).height() - win.height()) == Math.round(win.scrollTop())) || ($(document).height() - win.height()) - Math.round(win.scrollTop()) == 1) {
            this.setState({ loadingFeedData: true })
            this.loadFeedData()
        }
    };

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        this.init()
    };

    loadFeedData() {
        const { feedData, loadPosition, loadNumber } = this.state;

        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'https://mvpstandard-p.azurewebsites.net/profile/profile/getTalent',
            
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            data: { position: loadPosition, number: loadNumber },
            type: "GET",
            success: function (res) {
                const joinedData = feedData.concat(res.data);
                this.setState({
                    feedData: joinedData,
                    loadPosition: loadPosition + loadNumber,
                    loadingFeedData: false,
                })
            }.bind(this)
        })
    }

    render() {
        const { feedData, loadingFeedData } = this.state;

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui grid talent-feed container">
                    <div className="four wide column">
                        <CompanyProfile />
                    </div>
                    <div className="eight wide column ">
                        {feedData.map((feed, index) => (
                            <TalentCard key={index} feed={feed} />
                        ))}
                        {loadingFeedData ?
                            <Container fluid className="center aligned">
                                <Icon loading name='spinner' size="huge" />
                            </Container>
                            :
                            null
                        }
                    </div>
                    <div className="four wide column">
                        <div className="ui card">
                            <FollowingSuggestion />
                        </div>
                    </div>
                </div>
            </BodyWrapper >
        )
    }
}
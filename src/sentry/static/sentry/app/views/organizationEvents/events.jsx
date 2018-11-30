import {isEqual} from 'lodash';
import React from 'react';

import {Panel} from 'app/components/panels';
import AsyncView from 'app/views/asyncView';
import Pagination from 'app/components/pagination';
import SentryTypes from 'app/sentryTypes';
import withOrganization from 'app/utils/withOrganization';

import {getParams} from './utils/getParams';
import EventsChart from './eventsChart';
import EventsTable from './eventsTable';

class OrganizationEvents extends AsyncView {
  static propTypes = {
    organization: SentryTypes.Organization,
  };

  constructor(props) {
    super(props);
    this.projectsMap = new Map(
      props.organization.projects.map(project => [project.id, project])
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state !== nextState) {
      return true;
    }

    const isDiff = ['path', 'search'].find(
      key => !isEqual(this.props.location[key], nextProps.location[key])
    );

    if (isDiff) {
      return true;
    }

    return false;
  }

  shouldReload = true;

  getEndpoints() {
    const {organization, location} = this.props;
    let {statsPeriod, ...query} = location.query;

    return [
      [
        'events',
        `/organizations/${organization.slug}/events/`,
        {
          query: getParams({
            statsPeriod,
            ...query,
          }),
        },
      ],
    ];
  }

  getTitle() {
    return `Events - ${this.props.organization.slug}`;
  }

  renderError() {
    return this.renderBody();
  }

  renderLoading() {
    return this.renderBody();
  }

  renderBody() {
    const {organization} = this.props;
    const {loading, reloading, events, eventsPageLinks} = this.state;

    return (
      <React.Fragment>
        {this.state.error && super.renderError()}
        <Panel>
          <EventsChart loading={loading || reloading} organization={organization} />
        </Panel>

        <EventsTable
          loading={!reloading && loading}
          reloading={reloading}
          events={events}
          organization={organization}
        />

        <Pagination pageLinks={eventsPageLinks} />
      </React.Fragment>
    );
  }
}

export default withOrganization(OrganizationEvents);
export {OrganizationEvents};

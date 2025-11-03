import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// Views
import TechnicienMobile from "views/mobile/TechnicienMobile";
import NotificationsMobile from "views/mobile/NotificationsMobile";

export default function Mobile() {
  return (
    <>
      <Switch>
        <Route path="/mobile/technicien" exact component={TechnicienMobile} />
        <Route path="/mobile/notifications" exact component={NotificationsMobile} />
        <Redirect from="/mobile" to="/mobile/technicien" />
      </Switch>
    </>
  );
}

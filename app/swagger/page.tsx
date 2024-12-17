import React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerPage() {
  return (
    <React.Fragment>
      <SwaggerUI url="/api/v1/documentation" />
    </React.Fragment>
  );
}

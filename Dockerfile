FROM docker:19.03.2 as runtime
LABEL "repository"="https://github.com/webdestroya/cloud87-deploy"
LABEL "maintainer"="Mitch Dempsey"

RUN apk update \
  && apk upgrade \
  && apk add --no-cache git python py-pip bash jq \
  && pip install awscli  \
  && apk --purge -v del py-pip

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# FROM runtime as testEnv
# RUN apk add --no-cache coreutils bats ncurses
# ADD test.bats /test.bats
# ADD mock.sh /usr/local/bin/docker
# ADD mock.sh /usr/bin/date
# RUN /test.bats

FROM runtime
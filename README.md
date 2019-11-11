# Cloud87 Deploy

Trigger deployment to Cloud87 Infrastructure

## Usage

### New workflow
```yaml
name: Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - name: Deploy
      uses: webdestroya/cloud87-deploy@master
      with:
        project: myproject
        api_key: ${{ secrets.CLOUD87_API_KEY }}
        access_key: ${{ secrets.AWS_ACCESS_KEY }}
        secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        region: ${{ secrets.AWS_REGION }}

```

## Argument

The message which should appear in the release
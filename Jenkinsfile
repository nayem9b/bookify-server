pipeline {
    agent any
    environment {
        // SONAR_HOME = tool "Sonar"
        DOCKER_IMAGE = "nayem9b/sheba-backend-jenkins-build"
        DOCKER_TAG = "jenkins-build-${BUILD_NUMBER}"
        SONAR_SERVER = 'SonarQube'
        SONAR_TOKEN = credentials('sonar-token')
        SONAR_HOST_URL = 'http://127.0.0.1:9000'


        PROJECT_KEY = 'sheba'
        PROJECT_NAME = 'sheba'
        PROJECT_VERSION = '1.0.0'


        NODE_VERSION = '24'
    }
    stages {
        stage("Clone Code from Github") {
            steps {
                git url: "https://github.com/nayem9b/Sheba.xyz-backend.git", branch: "main"
            }
        }


        stage('Install Dependencies') {
            steps {
                script {
                    echo "Installing Node.js dependencies..."
                    sh '''
                        npm --version
                        node --version
                        npm install
                    '''
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    echo "Running JavaScript tests..."
                    sh '''
                        # Run your test command (adjust based on your test setup)
                        npm test || true

                        # If you're using Jest and want coverage
                        # npm run test:coverage || true

                        # If you're using other test frameworks, adjust accordingly
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    echo "Starting SonarQube analysis..."

                    withSonarQubeEnv("${SONAR_SERVER}") {
                        sh '''
                            # Using SonarQube Scanner CLI
                            sonar-scanner \
                                -Dsonar.projectKey=${PROJECT_KEY} \
                                -Dsonar.projectName="${PROJECT_NAME}" \
                                -Dsonar.projectVersion=${PROJECT_VERSION} \
                                -Dsonar.sources=src \
                                -Dsonar.exclusions="**/node_modules/**,**/coverage/**,**/*.spec.js,**/*.test.js,**/dist/**,**/build/**" \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.testExecutionReportPaths=test-results/test-report.xml \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.login=${SONAR_TOKEN}
                        '''
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    echo "Waiting for SonarQube Quality Gate..."
                    timeout(time: 5, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline aborted due to quality gate failure: ${qg.status}"
                        } else {
                            echo "Quality Gate passed successfully!"
                        }
                    }
                }
            }
        }        // stage("SonarQube Quality Check") {
        //     steps {
        //         withSonarQubeEnv("Sonar") {
        //             sh """
        //                 ${SONAR_HOME}/bin/sonar-scanner \
        //                 -Dsonar.projectName=wanderlust \
        //                 -Dsonar.projectKey=wanderlust
        //             """
        //         }
        //     }
        // }

        // stage("OWASP Dependency Check") {
        //     steps {
        //         dependencyCheck additionalArguments: '--scan ./', odcInstallation: 'dc'
        //         dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
        //     }
        // }

        // stage("Sonar Quality Gate Scan") {
        //     steps {
        //         timeout(time: 2, unit: 'MINUTES') {
        //             waitForQualityGate abortPipeline: false
        //         }
        //     }
        // }

        // stage("Trivy File System Scan") {
        //     steps {
        //         sh "trivy fs --format table -o trivy-fs-report.html ."
        //     }
        // }

        // stage("Build Docker Image") {
        //     steps {
        //         script {
        //             sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
        //             sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
        //         }
        //     }
        // }

        // stage("Push to Docker Hub") {
        //     steps {
        //         script {
        //             withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
        //                 sh "echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin"
        //                 sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
        //                 sh "docker push ${DOCKER_IMAGE}:latest"
        //             }
        //         }
        //     }
        // }

        // stage("Deploy using Docker Compose") {
        //     steps {
        //         sh "docker-compose up -d"
        //     }
        // }
    }    post {
        always {
            sh "docker logout"
            cleanWs()
        }
    }
}


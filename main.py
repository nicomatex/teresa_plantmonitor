from fastapi import FastAPI
import pprint
from startup import settings, users
from strawberry.fastapi import GraphQLRouter
import strawberry


@strawberry.type
class User:
    id: int

    def __init__(self, id):
        self.id = id

    @strawberry.field
    def age(self) -> int:
        return 10

    @strawberry.field
    def name(self) -> str:
        return "Nico"

    @strawberry.field
    def id(self) -> int:
        return self.id


@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello World"

    @strawberry.field
    def user(self, id: strawberry.ID) -> User:
        return User(id)


schema = strawberry.Schema(Query)
graphql_app = GraphQLRouter(schema)

app = FastAPI()
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
def read_root():
    some_user = users.find_one(None, {'_id': 0})
    pprint.pprint(some_user)
    return {"some user": some_user}

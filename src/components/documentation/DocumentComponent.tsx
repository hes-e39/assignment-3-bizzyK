//DocumentationComponent.tsx

import styled from "styled-components";
import { ReactNode } from "react";

interface DocumentComponentProps {
    title: string;
    component: ReactNode;
    propDocs: {
        prop: string;
        description: string;
        type: string;
        defaultValue: string;
    }[];
}

const Wrapper = styled.div`
    border: 1px solid var(--panel-border);
    margin: 20px 0;
    padding: 20px;
    border-radius: 8px;
    background-color: var(--panel-background);
`;

const Container = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const Title = styled.h3`
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-color);
`;

const RenderComponent = styled.div`
    flex: 1;
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--background-color);
    border-radius: 8px;
    border: 1px solid var(--panel-border);
    box-shadow: var(--box-shadow);
`;

const Documentation = styled.table`
    flex: 1;
    margin-left: 20px;
    border-collapse: collapse;
    width: 100%;
`;

const DocumentationHeader = styled.th`
    border: 1px solid var(--panel-border);
    text-align: left;
    padding: 8px;
    font-weight: bold;
    background-color: var(--panel-border);
    color: var(--text-color);
`;

const DocumentationCell = styled.td`
    border: 1px solid var(--panel-border);
    text-align: left;
    padding: 8px;
`;

const DocumentComponent: React.FC<DocumentComponentProps> = ({ title, component, propDocs }) => {
    return (
        <Wrapper>
            <Title>{title}</Title>
            <Container>
                <RenderComponent>{component}</RenderComponent>
                <Documentation aria-label={`Documentation for ${title}`}>
                    <thead>
                    <tr>
                        <DocumentationHeader>Prop</DocumentationHeader>
                        <DocumentationHeader>Description</DocumentationHeader>
                        <DocumentationHeader>Type</DocumentationHeader>
                        <DocumentationHeader>Default Value</DocumentationHeader>
                    </tr>
                    </thead>
                    <tbody>
                    {propDocs.map((doc) => (
                        <tr key={doc.prop}>
                            <DocumentationCell>{doc.prop}</DocumentationCell>
                            <DocumentationCell>{doc.description}</DocumentationCell>
                            <DocumentationCell>{doc.type}</DocumentationCell>
                            <DocumentationCell>
                                <code>{doc.defaultValue}</code>
                            </DocumentationCell>
                        </tr>
                    ))}
                    </tbody>
                </Documentation>
            </Container>
        </Wrapper>
    );
};

export default DocumentComponent;

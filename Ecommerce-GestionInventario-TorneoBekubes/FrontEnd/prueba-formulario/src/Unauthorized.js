import React from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2.5rem;
  max-width: 600px;
`;

const LockIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 2rem;
  color: #e74c3c;
  animation: ${shake} 0.8s cubic-bezier(.36,.07,.19,.97) both;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11);
  
  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <LockIcon>🔒</LockIcon>
      <Title>¡Acceso Restringido!</Title>
      <Subtitle>
        Lo sentimos, pero no tienes permiso para acceder a esta página. 
      </Subtitle>
    </Container>
  );
};

export default Unauthorized;